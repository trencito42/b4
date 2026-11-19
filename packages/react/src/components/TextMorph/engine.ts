/**
 * TextMorph's pure text-matching engine — no React, no DOM, fully unit
 * testable in isolation. Two responsibilities:
 *
 * 1. `segment()`: split a string into the tokens TextMorph treats as
 *    individually-animatable units — words or Unicode grapheme
 *    clusters (via `Intl.Segmenter`, with a documented fallback for
 *    environments that lack it — see `segmentFallback`).
 * 2. `matchByLcs`/`matchByPlaceValue`: given the previous and next
 *    token arrays, decide which tokens are the *same* token that
 *    moved (persistent), which are new (entering) and which
 *    disappeared (exiting) — the actual "matching" in text morphing.
 *    Two strategies:
 *      - `matchByLcs`: a classic longest-common-subsequence diff
 *        (same idea as a line-level text diff, applied to tokens).
 *        Handles insertion, deletion and substitution correctly, and
 *        because LCS only ever matches tokens in increasing original
 *        order, correctly keeps duplicate tokens ("the cat and the
 *        dog saw the cat") distinct instances rather than collapsing
 *        them into one. Honest limitation, shared with every plain
 *        LCS/Myers-style diff (Git diffs, React's own key-based list
 *        reconciliation): it can express insert/delete but not
 *        "move" — two tokens trading places with nothing between them
 *        to anchor a direction (e.g. the very first and last word of
 *        a sentence swapping, with no shared middle) both genuinely
 *        exit and re-enter rather than animating as a swap. A token
 *        with stable neighbors on at least one side (the common case)
 *        is correctly tracked as persistent and simply moves.
 *      - `matchByPlaceValue`: right-aligned positional matching for
 *        numeric strings, so unchanged low-order digits stay put and
 *        only the digits that actually changed (plus any newly
 *        appeared higher-order digit, e.g. 99 → 100) animate — digit
 *        identity by *place value*, not by character index from the
 *        left, which would misalign as soon as the digit count changes.
 */

export interface Token {
  id: string;
  text: string;
}

export type MatchedToken =
  | { kind: "persistent"; id: string; text: string; prevIndex: number; nextIndex: number }
  | { kind: "entering"; id: string; text: string; nextIndex: number }
  | { kind: "exiting"; id: string; text: string; prevIndex: number };

let idCounter = 0;
function nextId(prefix: string): string {
  idCounter += 1;
  return `${prefix}-${idCounter}`;
}

/**
 * Splits `text` into grapheme clusters (`granularity: "grapheme"`) or
 * words (`granularity: "word"`), using `Intl.Segmenter` when available.
 * `Intl.Segmenter` is what makes this safe for combining-diacritic
 * sequences, most emoji (including many ZWJ compounds), and
 * locale-aware word boundaries — a plain `Array.from(string)` or
 * `.split(" ")` gets all of these wrong (splits a combining accent
 * from its base letter, splits inside a compound emoji, doesn't know
 * CJK text has no spaces between words).
 */
export function segment(text: string, granularity: "word" | "grapheme", locale?: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(locale, { granularity });
    return Array.from(segmenter.segment(text), (s) => s.segment);
  }
  return segmentFallback(text, granularity);
}

/**
 * Fallback for environments without `Intl.Segmenter` (older browsers,
 * some SSR runtimes). Documented limitation: this does NOT correctly
 * handle combining diacritics typed as separate code points (rare in
 * practice — most real-world Romanian/Unicode text uses precomposed
 * characters, which `Array.from` *does* split correctly since it's
 * surrogate-pair-aware), ZWJ emoji sequences (each component emoji
 * becomes its own token instead of one compound glyph), or
 * script-aware word boundaries for languages without spaces. It is a
 * safe, honest degradation — tokens may be split slightly differently
 * than with `Intl.Segmenter`, not corrupted or crashing.
 */
export function segmentFallback(text: string, granularity: "word" | "grapheme"): string[] {
  if (granularity === "grapheme") {
    // Array.from is surrogate-pair-aware (real emoji/astral characters
    // survive as one token each); it just doesn't join multi-code-point
    // clusters like a base letter + combining accent or a ZWJ sequence.
    return Array.from(text);
  }
  // Keep whitespace as its own token (so it participates in the
  // matching/animation like any other token, rather than being
  // silently dropped or re-inserted with no identity).
  return text.split(/(\s+)/).filter((t) => t.length > 0);
}

/** True for a string made up of digit/numeric-punctuation tokens only — used by TextMorph's `mode="auto"` to pick the numeric matching strategy. */
export function looksNumeric(text: string): boolean {
  return /^[\s\-+$€£%0-9.,]+$/.test(text) && /\d/.test(text);
}

function toTokens(strings: string[], idPrefix: string): Token[] {
  return strings.map((text) => ({ id: nextId(idPrefix), text }));
}

/**
 * Longest-common-subsequence diff between two token-string arrays.
 * Standard O(n·m) DP table — fine at sentence/label length (this is
 * not meant for paragraph-scale text). Matches are found by walking
 * the DP table backward; because the walk only ever moves to a
 * strictly earlier (row, col), duplicate token values can never both
 * match the same single prior occurrence, so "cat and dog and cat"
 * keeps its two "cat"s as distinct, independently-tracked instances.
 */
export function matchByLcs(prevStrings: string[], nextStrings: string[]): MatchedToken[] {
  const n = prevStrings.length;
  const m = nextStrings.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i]![j] = prevStrings[i] === nextStrings[j] ? dp[i + 1]![j + 1]! + 1 : Math.max(dp[i + 1]![j]!, dp[i]![j + 1]!);
    }
  }

  const prevIds = toTokens(prevStrings, "p");
  const nextIds = toTokens(nextStrings, "n");
  const result: MatchedToken[] = [];

  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (prevStrings[i] === nextStrings[j]) {
      result.push({ kind: "persistent", id: prevIds[i]!.id, text: nextStrings[j]!, prevIndex: i, nextIndex: j });
      i += 1;
      j += 1;
    } else if (dp[i + 1]![j]! >= dp[i]![j + 1]!) {
      result.push({ kind: "exiting", id: prevIds[i]!.id, text: prevStrings[i]!, prevIndex: i });
      i += 1;
    } else {
      result.push({ kind: "entering", id: nextIds[j]!.id, text: nextStrings[j]!, nextIndex: j });
      j += 1;
    }
  }
  while (i < n) {
    result.push({ kind: "exiting", id: prevIds[i]!.id, text: prevStrings[i]!, prevIndex: i });
    i += 1;
  }
  while (j < m) {
    result.push({ kind: "entering", id: nextIds[j]!.id, text: nextStrings[j]!, nextIndex: j });
    j += 1;
  }

  return result;
}

/**
 * Right-aligned digit matching: pairs characters from the *end* of
 * `prevStr`/`nextStr` backward (ones place, tens place, …), so a
 * changed low-order digit never misidentifies an unchanged high-order
 * one as having moved, and a value that gained a new leading digit
 * (99 → 100) correctly shows just that one digit "entering" rather
 * than re-animating the whole number. Non-digit characters (currency
 * symbols, thousands separators, decimal points, signs) participate
 * the same way, by their own position from the right — this is a
 * positional strategy, not a semantic one, which is the right
 * tradeoff for place-value digits specifically.
 */
export function matchByPlaceValue(prevStr: string, nextStr: string): MatchedToken[] {
  const prev = Array.from(prevStr);
  const next = Array.from(nextStr);
  const prevIds = toTokens(prev, "p");
  const nextIds = toTokens(next, "n");
  const maxLen = Math.max(prev.length, next.length);

  // Build right-to-left first (that's how place-value alignment works —
  // ones place, tens place, …), each slot holding at most an exiting
  // old digit immediately followed by its persistent/entering
  // replacement, then reverse once at the end to restore left-to-right
  // reading order — this keeps an exiting digit adjacent to the digit
  // replacing it (not shoved to the end of the whole output), so
  // neighboring tokens' layout-shift reads as that one place value
  // changing in place, not the entire number reshuffling.
  const slots: MatchedToken[][] = [];
  for (let k = 0; k < maxLen; k++) {
    const pi = prev.length - 1 - k;
    const ni = next.length - 1 - k;
    const slot: MatchedToken[] = [];
    if (pi >= 0 && ni >= 0 && prev[pi] === next[ni]) {
      slot.push({ kind: "persistent", id: prevIds[pi]!.id, text: next[ni]!, prevIndex: pi, nextIndex: ni });
    } else {
      if (pi >= 0) slot.push({ kind: "exiting", id: prevIds[pi]!.id, text: prev[pi]!, prevIndex: pi });
      if (ni >= 0) slot.push({ kind: "entering", id: nextIds[ni]!.id, text: next[ni]!, nextIndex: ni });
    }
    slots.push(slot);
  }

  return slots.reverse().flat();
}
