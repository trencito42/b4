/**
 * B4 First-Party Intelligent Text Morphing Engine
 *
 * Implements locale-aware text tokenization, Unicode grapheme segmentation,
 * digit-place-value parsing, and distance-affinity diffing for seamless
 * spatial text transformations.
 */

export type TextMorphMode = "auto" | "words" | "characters" | "numbers";

export type TokenType =
  | "word"
  | "whitespace"
  | "punctuation"
  | "digit"
  | "symbol"
  | "grapheme";

export interface MorphToken {
  /** The text slice represented by this token */
  text: string;
  /** Syntactic or semantic type of token */
  type: TokenType;
  /** Index in original source string */
  index: number;
  /**
   * For numeric digits: the 10^n place value relative to decimal point.
   * e.g. for "123.45":
   * '3' has place 0 (units)
   * '2' has place 1 (tens)
   * '1' has place 2 (hundreds)
   * '4' has place -1 (tenths)
   * '5' has place -2 (hundredths)
   */
  numericPlace?: number;
  /** Unique persistent identity assigned during diffing */
  id: string;
}

export interface MatchPair {
  oldId: string;
  oldToken: MorphToken;
  newToken: MorphToken;
}

export interface DiffResult {
  /** Tokens present in the new text to be rendered in flow */
  newTokens: MorphToken[];
  /** Map of newToken.id -> MatchPair */
  matches: Map<string, MatchPair>;
  /** Exiting tokens from previous text that are not matched in new text */
  exitingTokens: MorphToken[];
}

let idCounter = 0;
export function generateTokenId(prefix = "token"): string {
  return `${prefix}-${++idCounter}`;
}

/** Check if a string represents a number or numeric measurement (e.g. "1204", "$99.95", "-12.5%", "45 MB/s") */
export function isNumericString(str: string): boolean {
  const trimmed = str.trim();
  if (!trimmed) return false;
  // Contains at least one digit and only common currency/signs/digits/separators/units
  return /\d/.test(trimmed) && /^[\s$€£¥₹₽₩+\-−~≈]*\d[\d\s,.'’_]*(\.\d+)?[\s%€$A-Za-z/]*$/.test(trimmed);
}

/**
 * Unicode-aware grapheme segmenter with fallback.
 * Properly segments emojis (including ZWJ families 👨‍👩‍👧‍👦, flags 🇷🇴, skin tones 👍🏽)
 * and composite diacritics (e.g. Romanian ș, ț, ă, î, â).
 */
export function segmentGraphemes(text: string, locale?: string): string[] {
  if (!text) return [];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter(locale, { granularity: "grapheme" });
      const results: string[] = [];
      for (const seg of segmenter.segment(text)) {
        results.push(seg.segment);
      }
      return results;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: match Unicode grapheme cluster approximation (base character + combining marks)
  const graphemeRegex = /\P{M}\p{M}*/gu;
  const matches = text.match(graphemeRegex);
  return matches && matches.length > 0 ? matches : Array.from(text);
}

/**
 * Locale-aware word segmenter with fallback.
 * Distinguishes words, whitespaces, and punctuation.
 */
export function segmentWords(text: string, locale?: string): { text: string; type: TokenType }[] {
  if (!text) return [];
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    try {
      const segmenter = new (Intl as any).Segmenter(locale, { granularity: "word" });
      const results: { text: string; type: TokenType }[] = [];
      for (const seg of segmenter.segment(text)) {
        let type: TokenType = "word";
        if (seg.isWordLike) {
          type = "word";
        } else if (/^\s+$/.test(seg.segment)) {
          type = "whitespace";
        } else {
          type = "punctuation";
        }
        results.push({ text: seg.segment, type });
      }
      return results;
    } catch {
      // Fall through to fallback
    }
  }

  // Fallback: regex for word-like, whitespace, punctuation
  const regex = /([^\s\p{P}]+|\s+|[\p{P}])/gu;
  const results: { text: string; type: TokenType }[] = [];
  let match: RegExpExecArray | null;
  while ((match = regex.exec(text)) !== null) {
    const raw = match[0];
    let type: TokenType = "word";
    if (/^\s+$/.test(raw)) {
      type = "whitespace";
    } else if (/^[\p{P}]$/u.test(raw)) {
      type = "punctuation";
    }
    results.push({ text: raw, type });
  }
  return results;
}

/**
 * Segments a numeric string into structured tokens tagged with place values (units, tens, tenths, etc.)
 */
export function segmentNumeric(text: string): MorphToken[] {
  if (!text) return [];
  const tokens: MorphToken[] = [];
  
  // Find where the main number starts and ends
  // Format: [prefix][integerDigits][separator][fractionDigits][suffix]
  const numMatch = text.match(/^([^\d]*)([\d,.'’_\s]+?)(?:([.,])(\d+))?([^\d]*)$/);
  
  if (!numMatch) {
    // If complex format, segment as words/digits
    return segmentWords(text).map((item, idx) => ({
      text: item.text,
      type: item.type,
      index: idx,
      id: generateTokenId("num"),
    }));
  }

  const prefix = numMatch[1] ?? "";
  const integerPart = numMatch[2] ?? "";
  const decimalSep = numMatch[3];
  const fractionPart = numMatch[4];
  const suffix = numMatch[5] ?? "";

  let currentIndex = 0;

  // Prefix tokens
  if (prefix) {
    tokens.push({
      text: prefix,
      type: "symbol",
      index: currentIndex,
      id: generateTokenId("pre"),
    });
    currentIndex += prefix.length;
  }

  // Extract pure digits from integer part to calculate place values right-to-left
  const intChars = Array.from(integerPart);
  const intDigitsOnly = intChars.filter((c) => /\d/.test(c));
  let digitRank = intDigitsOnly.length - 1; // 0 for units, 1 for tens, 2 for hundreds...

  for (const char of intChars) {
    if (/\d/.test(char)) {
      tokens.push({
        text: char,
        type: "digit",
        index: currentIndex,
        numericPlace: digitRank--,
        id: generateTokenId("digit"),
      });
    } else {
      tokens.push({
        text: char,
        type: /^\s+$/.test(char) ? "whitespace" : "punctuation",
        index: currentIndex,
        id: generateTokenId("sep"),
      });
    }
    currentIndex += char.length;
  }

  // Decimal separator
  if (decimalSep) {
    tokens.push({
      text: decimalSep,
      type: "punctuation",
      index: currentIndex,
      id: generateTokenId("dec"),
    });
    currentIndex += decimalSep.length;
  }

  // Fraction digits
  if (fractionPart) {
    const fracChars = Array.from(fractionPart);
    let fracRank = -1; // -1 for tenths, -2 for hundredths...
    for (const char of fracChars) {
      if (/\d/.test(char)) {
        tokens.push({
          text: char,
          type: "digit",
          index: currentIndex,
          numericPlace: fracRank--,
          id: generateTokenId("frac"),
        });
      } else {
        tokens.push({
          text: char,
          type: "punctuation",
          index: currentIndex,
          id: generateTokenId("sep"),
        });
      }
      currentIndex += char.length;
    }
  }

  // Suffix tokens
  if (suffix) {
    tokens.push({
      text: suffix,
      type: "symbol",
      index: currentIndex,
      id: generateTokenId("suf"),
    });
  }

  return tokens;
}

/**
 * Resolves the effective mode if "auto" was requested.
 */
export function resolveEffectiveMode(value: string, mode: TextMorphMode): "words" | "characters" | "numbers" {
  if (mode !== "auto") return mode;
  if (isNumericString(value)) return "numbers";
  // If it's a short token with no whitespace (e.g. "Save", "Submit", "Open"), character morphing looks magical
  if (value.length <= 8 && !/\s/.test(value)) return "characters";
  return "words";
}

/**
 * Tokenizes text according to the selected mode.
 */
export function tokenizeText(value: string | number, mode: TextMorphMode = "auto", locale?: string): MorphToken[] {
  const str = String(value ?? "");
  if (!str) return [];

  const effectiveMode = resolveEffectiveMode(str, mode);

  if (effectiveMode === "numbers") {
    return segmentNumeric(str);
  }

  if (effectiveMode === "characters") {
    const graphemes = segmentGraphemes(str, locale);
    let currentIndex = 0;
    return graphemes.map((g) => {
      let type: TokenType = "grapheme";
      if (/^\s+$/.test(g)) type = "whitespace";
      else if (/^[\p{P}]$/u.test(g)) type = "punctuation";
      else if (/^\d$/.test(g)) type = "digit";

      const tok: MorphToken = {
        text: g,
        type,
        index: currentIndex,
        id: generateTokenId("char"),
      };
      currentIndex += g.length;
      return tok;
    });
  }

  // Words mode
  const words = segmentWords(str, locale);
  let currentIndex = 0;
  return words.map((w) => {
    const tok: MorphToken = {
      text: w.text,
      type: w.type,
      index: currentIndex,
      id: generateTokenId("word"),
    };
    currentIndex += w.text.length;
    return tok;
  });
}

/**
 * Computes optimal bipartite / affinity diffing between old tokens and new tokens.
 *
 * Employs distance affinity:
 * When a token (e.g. "the" or " ") occurs multiple times, matches the pair
 * with the smallest relative positional distance |oldPos - newPos| to prevent
 * cross-jumping across the screen.
 *
 * In numeric mode, matches digits by place-value when characters differ
 * (e.g. units 9 -> units 0) so digits transform in-place.
 */
export function diffTokens(oldTokens: MorphToken[], newTokens: MorphToken[]): DiffResult {
  const matches = new Map<string, MatchPair>();
  const matchedOldIndices = new Set<number>();
  const matchedNewIndices = new Set<number>();

  const oldTotal = Math.max(oldTokens.length, 1);
  const newTotal = Math.max(newTokens.length, 1);

  interface ScoredCandidate {
    oldIndex: number;
    newIndex: number;
    score: number;
  }

  const candidates: ScoredCandidate[] = [];

  // 1. Generate candidate matches with scoring
  for (let n = 0; n < newTokens.length; n++) {
    const nTok = newTokens[n];
    if (!nTok) continue;
    const nRel = n / newTotal;

    for (let o = 0; o < oldTokens.length; o++) {
      const oTok = oldTokens[o];
      if (!oTok) continue;
      const oRel = o / oldTotal;
      const distPenalty = Math.abs(nRel - oRel) * 30;

      // Case A: Exact character/text match
      if (nTok.text === oTok.text) {
        let score = 100 - distPenalty;
        if (nTok.type === oTok.type) score += 20;
        // Strong bonus if numeric place values match
        if (nTok.numericPlace !== undefined && nTok.numericPlace === oTok.numericPlace) {
          score += 50;
        }
        candidates.push({ oldIndex: o, newIndex: n, score });
      }
      // Case B: Numeric mode in-place digit match (same place value, different digit)
      else if (
        nTok.type === "digit" &&
        oTok.type === "digit" &&
        nTok.numericPlace !== undefined &&
        nTok.numericPlace === oTok.numericPlace
      ) {
        // Digits at same place value (e.g. 9 -> 0 at units) get high affinity
        const score = 60 - distPenalty;
        candidates.push({ oldIndex: o, newIndex: n, score });
      }
    }
  }

  // 2. Sort candidates by highest score (best match first)
  candidates.sort((a, b) => b.score - a.score);

  // 3. Greedily match optimal pairs
  for (const cand of candidates) {
    if (matchedOldIndices.has(cand.oldIndex) || matchedNewIndices.has(cand.newIndex)) {
      continue;
    }
    const oldTok = oldTokens[cand.oldIndex];
    const newTok = newTokens[cand.newIndex];
    if (!oldTok || !newTok) continue;

    matchedOldIndices.add(cand.oldIndex);
    matchedNewIndices.add(cand.newIndex);

    // Assign stable identity from old token to new token
    newTok.id = oldTok.id;

    matches.set(newTok.id, {
      oldId: oldTok.id,
      oldToken: oldTok,
      newToken: newTok,
    });
  }

  // 4. Compute entering tokens (unmatched in new)
  for (let n = 0; n < newTokens.length; n++) {
    if (!matchedNewIndices.has(n)) {
      const newTok = newTokens[n];
      if (newTok) {
        // Keep its own unique enter id
        newTok.id = generateTokenId("enter");
      }
    }
  }

  // 5. Compute exiting tokens (unmatched in old)
  const exitingTokens: MorphToken[] = [];
  for (let o = 0; o < oldTokens.length; o++) {
    if (!matchedOldIndices.has(o)) {
      const oTok = oldTokens[o];
      if (oTok) {
        exitingTokens.push(oTok);
      }
    }
  }

  return {
    newTokens,
    matches,
    exitingTokens,
  };
}
