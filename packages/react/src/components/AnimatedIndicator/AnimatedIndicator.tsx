import { motion, type MotionProps } from "motion/react";
import { springs, type SpringToken, useReducedMotion } from "@b4/motion";

export interface AnimatedIndicatorProps extends Omit<MotionProps, "transition" | "layoutId"> {
  /**
   * The shared layout id this indicator travels under. Must be unique per
   * indicator instance on the page (e.g. derived from `useId()`) — reusing
   * an id across unrelated indicators causes them to animate toward each
   * other's position instead of their own.
   */
  layoutId: string;
  /** Which spring preset drives the travel. Defaults to "travel" — see MOTION_SPEC.md. */
  spring?: SpringToken;
  className?: string;
}

/**
 * The shared "traveling capsule/indicator" primitive — the reusable version
 * of the pattern `SegmentedControl` introduced. Render it conditionally
 * inside whichever element currently represents the selected/active state
 * (never more than one mounted at a time for a given `layoutId`); Motion's
 * layout-projection system animates it from its last known position to its
 * new one automatically, including across rapid repeated selection changes
 * (each new mount just redirects the in-flight animation).
 *
 * Respects `useReducedMotion()` — under reduced motion the indicator still
 * moves, but instantly (duration 0), never a cut to a different visual
 * treatment.
 */
export function AnimatedIndicator({
  layoutId,
  spring = "travel",
  className,
  ...rest
}: AnimatedIndicatorProps) {
  const reducedMotion = useReducedMotion();

  return (
    <motion.div
      layoutId={layoutId}
      className={className}
      transition={reducedMotion ? { duration: 0 } : springs[spring]}
      {...rest}
    />
  );
}
