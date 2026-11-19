import {
  forwardRef,
  useRef,
  useState,
  useEffect,
  useLayoutEffect,
  type CSSProperties,
  type ReactElement,
} from "react";
import { animate } from "motion/react";
import { springs, durations, easings, type SpringToken, useReducedMotion } from "@b4/motion";
import {
  tokenizeText,
  diffTokens,
  type MorphToken,
  type TextMorphMode,
} from "./engine.js";

const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

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

interface ExitingItem {
  id: string;
  token: MorphToken;
  left: number;
  top: number;
  width: number;
  height: number;
}

/**
 * B4 First-Party Intelligent Text Morphing Engine
 *
 * Provides character, word, and digit-place-value text morphing with
 * physical spring continuity, FLIP spatial projection, and accessible DOM semantics.
 */
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
  const Component = as as any;

  const containerRef = useRef<HTMLElement | null>(null);
  const tokenElsRef = useRef<Map<string, HTMLElement>>(new Map());
  const exitingElsRef = useRef<Map<string, HTMLElement>>(new Map());

  // Keep track of measured rects across renders
  const prevTokenRectsRef = useRef<Map<string, DOMRect>>(new Map());
  const prevContainerRectRef = useRef<DOMRect | null>(null);
  const isInitialMountRef = useRef(true);

  // Active in-flight animations so we can cleanly stop/interrupt on rapid updates
  const activeAnimationsRef = useRef<Set<{ stop: () => void }>>(new Set());

  // Store tokens in state, updated on value or mode change
  const [tokens, setTokens] = useState<MorphToken[]>(() => tokenizeText(value, mode, locale));
  const [exitingItems, setExitingItems] = useState<ExitingItem[]>([]);
  const prevValueRef = useRef(value);
  const prevTokensRef = useRef<MorphToken[]>(tokens);

  // Handle value change during render cycle
  if (value !== prevValueRef.current) {
    const newTokens = tokenizeText(value, mode, locale);
    const diff = diffTokens(prevTokensRef.current, newTokens);

    // Compute exiting items with their last known measured rects
    const containerRect = containerRef.current?.getBoundingClientRect();
    const newExiting: ExitingItem[] = [];

    if (containerRect && diff.exitingTokens.length > 0) {
      for (const exTok of diff.exitingTokens) {
        const measured = prevTokenRectsRef.current.get(exTok.id);
        if (measured) {
          newExiting.push({
            id: exTok.id,
            token: exTok,
            left: measured.left - containerRect.left,
            top: measured.top - containerRect.top,
            width: measured.width,
            height: measured.height,
          });
        }
      }
    }

    prevValueRef.current = value;
    prevTokensRef.current = diff.newTokens;
    setTokens(diff.newTokens);
    if (newExiting.length > 0) {
      setExitingItems(newExiting);
    }
  }

  // FLIP spatial morphing effect
  useIsomorphicLayoutEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // Initial mount: record initial rects without animating
    if (isInitialMountRef.current) {
      isInitialMountRef.current = false;
      const initialContainerRect = container.getBoundingClientRect();
      prevContainerRectRef.current = initialContainerRect;
      const initialMap = new Map<string, DOMRect>();
      for (const tok of tokens) {
        const el = tokenElsRef.current.get(tok.id);
        if (el) {
          initialMap.set(tok.id, el.getBoundingClientRect());
        }
      }
      prevTokenRectsRef.current = initialMap;
      return;
    }

    // Under reduced motion: snap immediately with zero duration
    if (reducedMotion) {
      if (exitingItems.length > 0) {
        setExitingItems([]);
      }
      const map = new Map<string, DOMRect>();
      for (const tok of tokens) {
        const el = tokenElsRef.current.get(tok.id);
        if (el) {
          map.set(tok.id, el.getBoundingClientRect());
        }
      }
      prevTokenRectsRef.current = map;
      prevContainerRectRef.current = container.getBoundingClientRect();
      return;
    }

    // Stop previous in-flight animations to avoid stale conflicts
    for (const anim of activeAnimationsRef.current) {
      anim.stop();
    }
    activeAnimationsRef.current.clear();

    const newContainerRect = container.getBoundingClientRect();
    const prevContainerRect = prevContainerRectRef.current;
    const prevTokenRects = prevTokenRectsRef.current;
    const springConfig = springs[spring] ?? springs.travel;

    // 1. Container fluid width and height adaptation
    if (prevContainerRect) {
      const dw = prevContainerRect.width - newContainerRect.width;
      const dh = prevContainerRect.height - newContainerRect.height;

      if (Math.abs(dw) > 1 || Math.abs(dh) > 1) {
        const containerAnim = animate(
          container,
          {
            width: [`${prevContainerRect.width}px`, `${newContainerRect.width}px`],
            height: [`${prevContainerRect.height}px`, `${newContainerRect.height}px`],
          },
          springConfig,
        );
        activeAnimationsRef.current.add(containerAnim);
        containerAnim.then(() => {
          container.style.width = "";
          container.style.height = "";
          activeAnimationsRef.current.delete(containerAnim);
        });
      }
    }

    // 2. Animate surviving tokens (FLIP invert & play)
    const nextTokenRects = new Map<string, DOMRect>();

    for (const tok of tokens) {
      const el = tokenElsRef.current.get(tok.id);
      if (!el) continue;

      const newRect = el.getBoundingClientRect();
      nextTokenRects.set(tok.id, newRect);

      const oldRect = prevTokenRects.get(tok.id);
      if (oldRect) {
        const dx = oldRect.left - newRect.left;
        const dy = oldRect.top - newRect.top;

        if (Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) {
          const tokenAnim = animate(
            el,
            {
              transform: [
                `translate3d(${dx}px, ${dy}px, 0)`,
                "translate3d(0px, 0px, 0)",
              ],
            },
            springConfig,
          );
          activeAnimationsRef.current.add(tokenAnim);
          tokenAnim.then(() => {
            el.style.transform = "";
            activeAnimationsRef.current.delete(tokenAnim);
          });
        }
      } else {
        // Entering token: a quick, fixed-duration fade + slide-up — no
        // `scale()` and no lingering blur. An earlier version animated
        // scale(0.85→1) + blur(3px→0) + translateY together on the same
        // spring as everything else; because a spring's settle time isn't
        // fixed, that read as the new character visibly squishing/melting
        // for the whole transition and only "snapping" into its true shape
        // at the very end — reported as ugly, not refined. A short
        // `durations.fast` tween with the dedicated `easings.enter` curve
        // (decelerating, no overshoot) resolves in ~140ms: the letter
        // slides up and fades in without ever being a visibly distorted
        // shape along the way.
        const enterAnim = animate(
          el,
          {
            opacity: [0, 1],
            transform: ["translate3d(0px, 3px, 0)", "translate3d(0px, 0px, 0)"],
          },
          { duration: durations.fast, ease: easings.enter },
        );
        activeAnimationsRef.current.add(enterAnim);
        enterAnim.then(() => {
          el.style.opacity = "";
          el.style.transform = "";
          activeAnimationsRef.current.delete(enterAnim);
        });
      }
    }

    // 3. Animate exiting tokens (fade out + blur in absolute overlay)
    if (exitingItems.length > 0) {
      let remaining = exitingItems.length;
      for (const item of exitingItems) {
        const el = exitingElsRef.current.get(item.id);
        if (el) {
          const exitAnim = animate(
            el,
            {
              opacity: [1, 0],
              transform: ["scale(1) translate3d(0px, 0px, 0)", "scale(0.85) translate3d(0px, -4px, 0)"],
              filter: ["blur(0px)", "blur(3px)"],
            },
            {
              duration: durations.fast,
              ease: easings.exit,
            },
          );
          activeAnimationsRef.current.add(exitAnim);
          exitAnim.then(() => {
            activeAnimationsRef.current.delete(exitAnim);
            remaining--;
            if (remaining <= 0) {
              setExitingItems([]);
            }
          });
        }
      }
    }

    // Update refs for next diff
    prevContainerRectRef.current = newContainerRect;
    prevTokenRectsRef.current = nextTokenRects;

    return () => {
      for (const anim of activeAnimationsRef.current) {
        anim.stop();
      }
      activeAnimationsRef.current.clear();
    };
  }, [tokens, exitingItems, reducedMotion, spring]);

  const displayString = String(value ?? "");

  return (
    <Component
      ref={(node: HTMLElement | null) => {
        containerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as any).current = node;
        }
      }}
      className={["b4-text-morph", className ?? ""].filter(Boolean).join(" ")}
      style={style}
      aria-label={ariaLabel ?? displayString}
    >
      {/* Screen-reader accessible value: single unbroken text */}
      <span className="b4-text-morph__sr-only">{displayString}</span>

      {/* Visual tokens in flow */}
      {tokens.map((tok) => {
        const isSpace = tok.type === "whitespace";
        return (
          <span
            key={tok.id}
            ref={(node) => {
              if (node) tokenElsRef.current.set(tok.id, node);
              else tokenElsRef.current.delete(tok.id);
            }}
            className={[
              "b4-text-morph__token",
              isSpace && "b4-text-morph__token--space",
            ]
              .filter(Boolean)
              .join(" ")}
            aria-hidden="true"
          >
            {tok.text}
          </span>
        );
      })}

      {/* Exiting overlay tokens (absolutely positioned, unmounts on animation finish) */}
      {exitingItems.length > 0 && (
        <span className="b4-text-morph__exiting-overlay" aria-hidden="true">
          {exitingItems.map((item) => (
            <span
              key={item.id}
              ref={(node) => {
                if (node) exitingElsRef.current.set(item.id, node);
                else exitingElsRef.current.delete(item.id);
              }}
              className="b4-text-morph__exiting-token"
              style={{
                left: `${item.left}px`,
                top: `${item.top}px`,
                width: `${item.width}px`,
                height: `${item.height}px`,
              }}
              aria-hidden="true"
            >
              {item.token.text}
            </span>
          ))}
        </span>
      )}
    </Component>
  );
});
