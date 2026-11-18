import { Children, type CSSProperties, type ReactElement, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { tween, useReducedMotion } from "@b4/motion";

export interface TransitionGroupProps {
  /** Each child needs its own stable `key`, the standard React list convention — it's what `AnimatePresence` uses to tell "this item left" from "this item is new". */
  children: ReactNode;
  /** `li` items are only valid inside `ul`/`ol`; pick the container tag that matches. @default "div" */
  as?: "ul" | "ol" | "div";
  className?: string;
  style?: CSSProperties;
  /** Applied to each wrapping item element, not the container. */
  itemClassName?: string;
}

/**
 * A real enter/exit list — items animate in and out with `Motion`'s
 * `AnimatePresence` (`mode="popLayout"`, so a removed item's neighbors
 * slide smoothly into its place rather than snapping), not a plain
 * `.map()` where removed items simply vanish and added ones appear
 * instantly. Each child is automatically wrapped with the enter/exit
 * motion — consumers hand it a normal keyed list, not pre-wrapped
 * `motion.*` elements.
 */
export function TransitionGroup({ children, as = "div", className, style, itemClassName }: TransitionGroupProps) {
  const reducedMotion = useReducedMotion();
  const Container = as === "ul" ? motion.ul : as === "ol" ? motion.ol : motion.div;
  const Item = as === "div" ? motion.div : motion.li;
  const items = Children.toArray(children) as ReactElement[];

  return (
    <Container className={className} style={style}>
      <AnimatePresence mode="popLayout" initial={false}>
        {items.map((child) => (
          <Item
            key={child.key}
            layout
            initial={reducedMotion ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, y: -8 }}
            transition={reducedMotion ? { duration: 0 } : tween("base", "standard")}
            className={itemClassName}
          >
            {child}
          </Item>
        ))}
      </AnimatePresence>
    </Container>
  );
}
