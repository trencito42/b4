import { AnimatePresence, motion } from "motion/react";
import type { ReactNode } from "react";
import { tween, useReducedMotion } from "@b4/motion";

export type TextTransitionMode = "crossfade" | "vertical" | "horizontal";
export type TextTransitionDirection = "forward" | "backward";

export interface TextTransitionProps {
  /**
   * The value to display. Also the identity the transition keys off —
   * changing it (even to visually similar content) triggers a transition;
   * passing the same value again is a no-op re-render, not a replay.
   */
  value: string | number;
  /** How the old value exits and the new one enters. Defaults to "crossfade". */
  mode?: TextTransitionMode;
  /**
   * For "vertical"/"horizontal" modes: which way the new value enters from.
   * Ignored for "crossfade". Defaults to "forward".
   */
  direction?: TextTransitionDirection;
  className?: string;
  /** Rendered instead of `value` when a transition is in flight, if provided (rarely needed). */
  children?: ReactNode;
}

const DISTANCE_PX = 10;

function getVariants(mode: TextTransitionMode, direction: TextTransitionDirection) {
  if (mode === "crossfade") {
    return {
      initial: { opacity: 0, filter: "blur(4px)" },
      animate: { opacity: 1, filter: "blur(0px)" },
      exit: { opacity: 0, filter: "blur(4px)" },
    };
  }

  const sign = direction === "forward" ? 1 : -1;
  const axis = mode === "vertical" ? "y" : "x";

  return {
    initial: { opacity: 0, [axis]: DISTANCE_PX * sign },
    animate: { opacity: 1, [axis]: 0 },
    exit: { opacity: 0, [axis]: -DISTANCE_PX * sign },
  };
}

/**
 * B4's reusable text-change primitive: blur/opacity crossfade, vertical
 * replacement, or horizontal directional replacement — the three required
 * patterns from the mission brief. Used directly for label changes, and as
 * the building block for `NumberTransition`.
 *
 * - **Stable baseline alignment**: the outer wrapper is an inline-grid with
 *   both the entering and exiting nodes sharing the same grid cell
 *   (`grid-area: 1 / 1`), so the text never jumps baseline mid-transition —
 *   see TextTransition.css.
 * - **Smooth width adaptation**: the wrapper has `layout` enabled via
 *   Motion so its own box size animates to the new content's size rather
 *   than snapping.
 * - **Reduced motion**: collapses to an instant swap (`duration: 0`) —
 *   never left half-blurred or half-translated at rest.
 * - **Interruption/rapid changes**: `AnimatePresence mode="popLayout"`
 *   means a new `value` arriving before the previous transition finished
 *   simply redirects — the outgoing node keeps exiting, the new incoming
 *   node starts fresh — rather than snapping or stacking.
 */
export function TextTransition({
  value,
  mode = "crossfade",
  direction = "forward",
  className,
  children,
}: TextTransitionProps) {
  const reducedMotion = useReducedMotion();
  const variants = getVariants(mode, direction);
  const transition = reducedMotion ? { duration: 0 } : tween("base", "standard");

  return (
    <motion.span
      layout
      transition={transition}
      className={["b4-text-transition", className ?? ""].filter(Boolean).join(" ")}
    >
      <AnimatePresence mode="popLayout" initial={false}>
        <motion.span
          key={value}
          initial={reducedMotion ? false : variants.initial}
          animate={variants.animate}
          exit={reducedMotion ? undefined : variants.exit}
          transition={transition}
          className="b4-text-transition__item"
        >
          {children ?? value}
        </motion.span>
      </AnimatePresence>
    </motion.span>
  );
}
