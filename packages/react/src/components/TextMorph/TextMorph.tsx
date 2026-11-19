import {
  forwardRef,
  useCallback,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  type CSSProperties,
} from "react";
import { animate, type Transition } from "motion/react";
import {
  springs,
  durations,
  easings,
  type SpringToken,
  useReducedMotion,
} from "@b4/motion";
import {
  tokenizeText,
  diffTokens,
  type MorphToken,
  type TextMorphMode,
} from "./engine.js";

const useIsomorphicLayoutEffect =
  typeof window !== "undefined" ? useLayoutEffect : useEffect;

export interface TextMorphProps {
  /** The text or number to morph between */
  value: string | number;
  /**
   * Segmentation & matching mode:
   * - "auto": Intelligent detection (numbers, words, or character morph for short words)
   * - "words": Word and punctuation level
   * - "characters": Unicode grapheme cluster level
   * - "numbers": Digit place-value aware
   */
  mode?: TextMorphMode;
  /** B4 spring preset: "travel" (default), "snap", "settle", or "gentle" */
  spring?: SpringToken;
  /** Optional locale for Intl.Segmenter / formatting */
  locale?: string;
  /** Root HTML tag (defaults to "span") */
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
  className?: string;
  style?: CSSProperties;
  /** Accessible label override if different from raw value */
  "aria-label"?: string;
}

interface TokenPosition {
  left: number;
  top: number;
  width: number;
  height: number;
  opacity: number;
}

interface Geometry {
  width: number;
  height: number;
  positions: Map<string, TokenPosition>;
}

interface Frame {
  value: TextMorphProps["value"];
  mode: TextMorphMode;
  locale?: string;
  tokens: MorphToken[];
  previous?: Geometry;
}

interface ExitingItem extends TokenPosition {
  token: MorphToken;
}

interface StyleUpdate {
  draw: (progress: number) => void;
  clear?: () => void;
}

const mix = (from: number, to: number, progress: number) => from + (to - from) * progress;

function measure(
  sizer: HTMLElement,
  elements: Map<string, HTMLElement>,
  readOpacity = false,
): Geometry {
  const origin = sizer.getBoundingClientRect();
  const positions = new Map<string, TokenPosition>();
  for (const [id, element] of elements) {
    const rect = element.getBoundingClientRect();
    positions.set(id, {
      left: rect.left - origin.left,
      top: rect.top - origin.top,
      width: rect.width,
      height: rect.height,
      opacity: readOpacity ? Number(getComputedStyle(element).opacity) : 1,
    });
  }
  return { width: origin.width, height: origin.height, positions };
}

const centerX = (position: TokenPosition) => position.left + position.width / 2;
const sameLine = (a: TokenPosition, b: TokenPosition) =>
  Math.abs(a.top - b.top) < Math.min(a.height, b.height) / 2;

export const TextMorph = forwardRef<HTMLElement, TextMorphProps>(function TextMorph(
  {
    value,
    mode = "auto",
    spring = "travel",
    locale,
    as = "span",
    className,
    style,
    "aria-label": ariaLabel,
  },
  forwardedRef,
) {
  const reducedMotion = useReducedMotion();
  const Component = as;
  const setRootRef = useCallback(
    (node: HTMLElement | null) => {
      if (typeof forwardedRef === "function") return forwardedRef(node);
      if (forwardedRef) forwardedRef.current = node;
    },
    [forwardedRef],
  );

  const sizerRef = useRef<HTMLSpanElement>(null);
  const flowRef = useRef<HTMLSpanElement>(null);
  const tokenEls = useRef(new Map<string, HTMLElement>());
  const exitEls = useRef(new Map<string, HTMLElement>());
  const playedFrame = useRef<Frame | null>(null);
  const [frame, setFrame] = useState<Frame>(() => ({
    value,
    mode,
    locale,
    tokens: tokenizeText(value, mode, locale),
  }));
  const [exits, setExits] = useState<ExitingItem[]>([]);

  useIsomorphicLayoutEffect(() => {
    if (Object.is(value, frame.value) && mode === frame.mode && locale === frame.locale)
      return;

    // The previous frame is still mounted here. Capture what is actually
    // on screen, including any in-flight transforms, before updating it.
    const previous =
      !reducedMotion && sizerRef.current
        ? measure(sizerRef.current, tokenEls.current, true)
        : undefined;
    const diff = diffTokens(frame.tokens, tokenizeText(value, mode, locale));
    setExits(
      diff.exitingTokens.flatMap((token) => {
        const position = previous?.positions.get(token.id);
        return position && token.type !== "whitespace" ? [{ token, ...position }] : [];
      }),
    );
    setFrame({ value, mode, locale, tokens: diff.newTokens, previous });
  }, [value, mode, locale, frame, reducedMotion]);

  useIsomorphicLayoutEffect(() => {
    const sizer = sizerRef.current;
    const flow = flowRef.current;
    if (reducedMotion) {
      setExits((items) => (items.length ? [] : items));
      return;
    }
    if (!sizer || !flow || !frame.previous || playedFrame.current === frame) return;
    playedFrame.current = frame;

    // Measure every target at its natural size before applying any FLIP
    // transform or interpolated width, which could reflow the new text.
    const previous = frame.previous;
    const next = measure(sizer, tokenEls.current);
    const flowWidth = flow.getBoundingClientRect().width;
    const travel: StyleUpdate[] = [];
    const fades: StyleUpdate[] = [];
    const cleanups: (() => void)[] = [];
    let cancelled = false;

    function play(
      updates: StyleUpdate[],
      transition: Transition,
      onComplete?: () => void,
    ) {
      if (!updates.length) return;
      const draw = (progress: number) => {
        for (const update of updates) update.draw(progress);
      };
      const clear = () => {
        for (const update of updates) update.clear?.();
      };

      // Animate a shared scalar for each phase. We own the inline styles,
      // so Motion has no final DOM write that could outlive this cleanup.
      draw(0);
      const animation = animate(0, 1, { ...transition, onUpdate: draw });
      animation.then(() => {
        if (cancelled) return;
        clear();
        onComplete?.();
      });
      cleanups.push(() => {
        animation.stop();
        clear();
      });
    }

    if (
      Math.abs(previous.width - next.width) > 1 ||
      Math.abs(previous.height - next.height) > 1
    ) {
      flow.style.inlineSize = flowWidth + "px";
      travel.push({
        draw(progress) {
          sizer.style.width =
            Math.max(0, mix(previous.width, next.width, progress)) + "px";
          sizer.style.height =
            Math.max(0, mix(previous.height, next.height, progress)) + "px";
        },
        clear() {
          sizer.style.width = "";
          sizer.style.height = "";
          flow.style.inlineSize = "";
        },
      });
    }

    const moves = frame.tokens.flatMap((token) => {
      const from = previous.positions.get(token.id);
      const to = next.positions.get(token.id);
      return token.type === "word" && from && to ? [{ id: token.id, from, to }] : [];
    });

    for (const token of frame.tokens) {
      const element = tokenEls.current.get(token.id);
      const target = next.positions.get(token.id);
      if (!element || !target || token.type === "whitespace") continue;

      const from = previous.positions.get(token.id);
      if (!from) {
        fades.push({
          draw(progress) {
            element.style.opacity = String(progress);
            element.style.transform = "translateY(" + 0.15 * (1 - progress) + "em)";
          },
          clear() {
            element.style.opacity = "";
            element.style.transform = "";
          },
        });
        continue;
      }

      const dx = from.left - target.left;
      const dy = from.top - target.top;
      const moved = Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5;
      if (from.opacity < 1) {
        fades.push({
          draw(progress) {
            element.style.opacity = String(mix(from.opacity, 1, progress));
          },
          clear() {
            element.style.opacity = "";
          },
        });
      }

      if (!moved) continue;
      // Words exchanging order on one line pass on opposite sides of the
      // baseline. Glyphs in character and number modes keep their line.
      const crosses =
        token.type === "word" &&
        sameLine(from, target) &&
        moves.some(
          (other) =>
            other.id !== token.id &&
            sameLine(from, other.from) &&
            sameLine(target, other.to) &&
            (centerX(from) - centerX(other.from)) *
              (centerX(target) - centerX(other.to)) <
              0,
        );
      const arc = crosses ? target.height * 0.65 * Math.sign(dx) : 0;
      travel.push({
        draw(progress) {
          const lift = arc * Math.sin(Math.PI * Math.max(0, Math.min(1, progress)));
          const x = dx * (1 - progress);
          const y = dy * (1 - progress) + lift;
          element.style.transform = "translate3d(" + x + "px, " + y + "px, 0)";
        },
        clear() {
          element.style.transform = "";
        },
      });
    }

    // Removing the outgoing layer must not restart or stop the active FLIP.
    const outgoing = Array.from(exitEls.current.values());
    for (const element of outgoing) {
      const opacity = Number(element.style.opacity);
      fades.push({
        draw(progress) {
          element.style.opacity = String(opacity * (1 - progress));
          element.style.transform = "translateY(" + -0.15 * progress + "em)";
        },
      });
    }
    play(travel, springs[spring]);
    play(fades, { duration: durations.fast, ease: easings.standard }, () => {
      if (outgoing.length) setExits([]);
    });

    return () => {
      cancelled = true;
      for (const cleanup of cleanups) cleanup();
    };
  }, [frame, reducedMotion, spring]);

  const displayString = String(value ?? "");

  return (
    <Component
      ref={setRootRef}
      className={["b4-text-morph", className ?? ""].filter(Boolean).join(" ")}
      style={style}
      aria-label={ariaLabel ?? displayString}
    >
      <span className="b4-text-morph__sr-only">{displayString}</span>
      <span className="b4-text-morph__sizer" ref={sizerRef} aria-hidden="true">
        <span className="b4-text-morph__flow" ref={flowRef}>
          {frame.tokens.map((token) => (
            <span
              key={token.id}
              ref={(node) => {
                if (node) tokenEls.current.set(token.id, node);
                else tokenEls.current.delete(token.id);
              }}
              className={
                token.type === "whitespace"
                  ? "b4-text-morph__token b4-text-morph__token--space"
                  : "b4-text-morph__token"
              }
              aria-hidden="true"
            >
              {token.text}
            </span>
          ))}
        </span>
        {exits.length > 0 && (
          <span className="b4-text-morph__exiting-overlay" aria-hidden="true">
            {exits.map(({ token, left, top, width, height, opacity }) => (
              <span
                key={token.id}
                ref={(node) => {
                  if (node) exitEls.current.set(token.id, node);
                  else exitEls.current.delete(token.id);
                }}
                className="b4-text-morph__exiting-token"
                style={{ left, top, width, height, opacity }}
                aria-hidden="true"
              >
                {token.text}
              </span>
            ))}
          </span>
        )}
      </span>
    </Component>
  );
});
