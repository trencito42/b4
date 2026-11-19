import {
  Children,
  forwardRef,
  isValidElement,
  type CSSProperties,
  type ForwardRefExoticComponent,
  type ReactElement,
  type ReactNode,
  type RefAttributes,
} from "react";
import { AnimatePresence, motion, type HTMLMotionProps } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";

export type TransitionGroupDirection = "vertical" | "horizontal";
export type TransitionGroupPreset = "slide-fade" | "scale-fade" | "fade";
export type TransitionGroupGap = "none" | "sm" | "md" | "lg";

/**
 * The container's real element type follows the `as` prop, so the
 * forwarded ref is the union of the three tags this component can render.
 */
type TransitionGroupElement = HTMLDivElement | HTMLOListElement | HTMLUListElement;

export interface TransitionGroupProps {
  /**
   * Keyed items to render. Each child needs a stable, unique `key` prop so
   * AnimatePresence can track item additions, removals, and reordering.
   */
  children: ReactNode;
  /** Pick the container element. Defaults to "div". When "ul" or "ol", items render as "li" without native list bullets. */
  as?: "ul" | "ol" | "div";
  /** Layout direction: "vertical" (column) or "horizontal" (row). Defaults to "vertical". */
  direction?: TransitionGroupDirection;
  /** Animation preset: "slide-fade", "scale-fade", or "fade". Defaults to "slide-fade". */
  preset?: TransitionGroupPreset;
  /** Gap between items using B4 space tokens. Defaults to "md". */
  gap?: TransitionGroupGap;
  /** Optional delay stagger per item in seconds (e.g. 0.04). Defaults to 0. */
  stagger?: number;
  className?: string;
  style?: CSSProperties;
  /** Applied to each wrapping item element. */
  itemClassName?: string;
}

function getVariants(preset: TransitionGroupPreset, direction: TransitionGroupDirection) {
  if (preset === "scale-fade") {
    return {
      initial: { opacity: 0, scale: 0.94 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.94 },
    };
  }

  if (preset === "fade") {
    return {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    };
  }

  // slide-fade (default)
  if (direction === "horizontal") {
    return {
      initial: { opacity: 0, x: 12, scale: 0.98 },
      animate: { opacity: 1, x: 0, scale: 1 },
      exit: { opacity: 0, x: -12, scale: 0.98 },
    };
  }

  return {
    initial: { opacity: 0, y: 10, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -8, scale: 0.98 },
  };
}

/**
 * B4's animated list container: items animate entering and exiting with
 * AnimatePresence `mode="popLayout"`. When an item leaves, remaining
 * sibling items smoothly glide into place via layout springs rather than
 * snapping or leaving awkward gaps.
 *
 * Automatically normalizes list semantics (strips browser bullet points
 * from ul/ol, wraps children in li) and supports vertical/horizontal directions,
 * scale/slide presets, and reduced-motion fallbacks.
 */
export const TransitionGroup = forwardRef<
  HTMLDivElement | HTMLOListElement | HTMLUListElement,
  TransitionGroupProps
>(function TransitionGroup(
  {
    children,
    as = "div",
    direction = "vertical",
    preset = "slide-fade",
    gap = "md",
    stagger = 0,
    className,
    style,
    itemClassName,
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  // `motion.ul`/`motion.ol`/`motion.div` are three distinct component
  // types, and a JSX union of them intersects their prop types — an
  // intersection no single ref can satisfy. Pin the container to one
  // shape and widen the ref to the union of the three real element types.
  const Container = (as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div) as unknown as ForwardRefExoticComponent<
    Omit<HTMLMotionProps<"div">, "ref"> & RefAttributes<TransitionGroupElement>
  >;
  const Item = as === "div" ? motion.div : motion.li;
  const items = Children.toArray(children).filter(isValidElement) as ReactElement[];
  const variants = getVariants(preset, direction);

  const containerClasses = [
    "b4-transition-group",
    `b4-transition-group--${direction}`,
    `b4-transition-group--gap-${gap}`,
    className ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  const itemClasses = [
    "b4-transition-group__item",
    itemClassName ?? "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <Container ref={ref} className={containerClasses} style={style}>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((child, index) => (
          <Item
            key={child.key}
            layout
            initial={reducedMotion ? false : variants.initial}
            animate={variants.animate}
            exit={reducedMotion ? { opacity: 0 } : variants.exit}
            transition={
              reducedMotion
                ? { duration: 0 }
                : {
                    ...springs.snap,
                    delay: stagger > 0 ? index * stagger : 0,
                  }
            }
            className={itemClasses}
          >
            {child}
          </Item>
        ))}
      </AnimatePresence>
    </Container>
  );
});
