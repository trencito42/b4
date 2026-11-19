import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";
import { segment, looksNumeric, matchByLcs, matchByPlaceValue, type MatchedToken } from "./engine.js";

export type TextMorphMode = "auto" | "words" | "characters" | "numbers";

export interface TextMorphProps {
  /** The full text to display. Changing it (even by one character) drives the morph. */
  value: string;
  /**
   * "auto" picks "numbers" when both the previous and next value look
   * purely numeric (digits/currency/%/separators — see
   * `engine.ts`'s `looksNumeric`), else "words". "characters" morphs
   * by Unicode grapheme cluster instead of by word — use it for short
   * labels where per-letter motion reads better than per-word.
   * Defaults to "auto".
   */
  mode?: TextMorphMode;
  /** Locale passed to `Intl.Segmenter` for word-boundary segmentation. */
  locale?: string;
  className?: string;
}

interface RenderToken {
  key: string;
  text: string;
}

function computeRenderTokens(prevValue: string, nextValue: string, mode: TextMorphMode, locale?: string): RenderToken[] {
  const useNumbers = mode === "numbers" || (mode === "auto" && looksNumeric(prevValue) && looksNumeric(nextValue));
  const matched: MatchedToken[] = useNumbers
    ? matchByPlaceValue(prevValue, nextValue)
    : matchByLcs(segment(prevValue, mode === "characters" ? "grapheme" : "word", locale), segment(nextValue, mode === "characters" ? "grapheme" : "word", locale));

  // AnimatePresence computes exits itself by diffing `key`s between this
  // render and the last — an "exiting" entry from the matcher isn't
  // rendered at all here; it did its job by *not* appearing, so its key
  // naturally drops out and AnimatePresence animates its removal.
  return matched.filter((t): t is Extract<MatchedToken, { kind: "persistent" | "entering" }> => t.kind !== "exiting").map((t) => ({ key: t.id, text: t.text }));
}

const tokenVariants = {
  initial: { opacity: 0, scale: 0.9, filter: "blur(3px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.9, filter: "blur(3px)" },
};

/**
 * B4's first-party intelligent text-morphing engine: changing `value`
 * doesn't crossfade the whole string (that's `TextTransition`) — each
 * word/character/digit is matched against its counterpart in the
 * previous value (see `engine.ts`), and surviving tokens visually
 * *move* to their new position (Motion's `layout` projection — real
 * FLIP, not a hand-rolled measurement pass) while only the tokens that
 * actually changed fade out/in.
 *
 * Accessibility: the real text lives in a visually-hidden
 * `.b4-text-morph__sr-only` span that updates to the full new `value`
 * immediately, in the same render — never waiting on the animation.
 * The animated token spans are `aria-hidden`, so assistive tech reads
 * the one logical value once, never a duplicated or fragmented
 * announcement from the individual moving pieces.
 */
export function TextMorph({ value, mode = "auto", locale, className }: TextMorphProps) {
  const reducedMotion = useReducedMotion();
  const [prevValue, setPrevValue] = useState(value);
  const [tokens, setTokens] = useState<RenderToken[]>(() => computeRenderTokens(value, value, mode, locale));

  // "Adjust state during render" (React's own documented pattern for
  // deriving state from a prop change without an extra render pass via
  // useEffect) — pure and StrictMode-safe: recomputing with the same
  // (prevValue, value) pair twice yields the same tokens, and the
  // setState calls are deduped when nothing actually changed.
  if (value !== prevValue) {
    setTokens(computeRenderTokens(prevValue, value, mode, locale));
    setPrevValue(value);
  }

  return (
    <span className={["b4-text-morph", className ?? ""].filter(Boolean).join(" ")}>
      <span className="b4-text-morph__visible" aria-hidden="true">
        <AnimatePresence mode="popLayout" initial={false}>
          {tokens.map((token) => (
            <motion.span
              key={token.key}
              layout
              initial={reducedMotion ? false : tokenVariants.initial}
              animate={tokenVariants.animate}
              exit={reducedMotion ? undefined : tokenVariants.exit}
              transition={reducedMotion ? { duration: 0 } : springs.travel}
              className="b4-text-morph__token"
            >
              {token.text === " " ? " " : token.text}
            </motion.span>
          ))}
        </AnimatePresence>
      </span>
      <span className="b4-text-morph__sr-only">{value}</span>
    </span>
  );
}
