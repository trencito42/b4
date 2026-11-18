import { motion, type HTMLMotionProps } from "motion/react";
import { springs, type SpringToken, useReducedMotion } from "@b4/motion";

export interface MorphingSurfaceProps extends Omit<HTMLMotionProps<"div">, "transition" | "layout" | "layoutId"> {
  /** Use `span` inside phrasing containers (e.g. a label/button), same convention as `AnimatedIndicator`. */
  as?: "div" | "span";
  /**
   * A shared layout id, for morphing *between two different mount
   * points* (e.g. a list item expanding into a detail panel elsewhere
   * in the tree) rather than just resizing in place. Omit it for a
   * surface that only needs to animate its own size/position changes —
   * layout animation still applies without one.
   */
  layoutId?: string;
  spring?: SpringToken;
  className?: string;
}

/**
 * A real FLIP-based morph, not a fade/crossfade standing in for one:
 * Motion's `layout` projection measures this element's size and
 * position before and after a re-render (a size change, a reflow from
 * sibling content, or — with `layoutId` — an entirely different
 * element mounting elsewhere with the same id) and animates the visual
 * difference smoothly. The general-purpose counterpart to
 * `AnimatedIndicator` (that one is specifically a decorative indicator
 * traveling behind other content); this one is the content surface
 * itself morphing.
 */
export function MorphingSurface({ as = "div", layoutId, spring = "travel", className, children, ...rest }: MorphingSurfaceProps) {
  const reducedMotion = useReducedMotion();
  const Surface = as === "span" ? motion.span : motion.div;

  return (
    <Surface
      layout
      layoutId={layoutId}
      transition={reducedMotion ? { duration: 0 } : springs[spring]}
      className={className}
      {...rest}
    >
      {children}
    </Surface>
  );
}
