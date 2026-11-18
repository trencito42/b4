import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { springs } from "@b4/motion";
import { useReducedMotion } from "@b4/motion";
import type { CardPadding } from "../Card/Card";

export interface InteractiveCardProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Inner padding scale. Defaults to "md". */
  padding?: CardPadding;
  children?: ReactNode;
}

/**
 * B4's clickable content surface — Card's press/hover-affordant sibling.
 * A real `<button>`, not a `<div onClick>`, so it's keyboard-operable and
 * has correct semantics without extra ARIA. Shares Button's press spring
 * so the two "actionable surface" components feel like one system.
 */
export const InteractiveCard = forwardRef<HTMLButtonElement, InteractiveCardProps>(
  function InteractiveCard(
    { padding = "md", disabled = false, children, className, type = "button", ...rest },
    ref,
  ) {
    const reducedMotion = useReducedMotion();

    const classNames = [
      "b4-interactive-card",
      `b4-interactive-card--padding-${padding}`,
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.button
        ref={ref}
        type={type}
        className={classNames}
        disabled={disabled}
        aria-disabled={disabled || undefined}
        whileHover={reducedMotion || disabled ? undefined : { y: -2 }}
        whileTap={reducedMotion || disabled ? undefined : { scale: 0.98 }}
        transition={springs.snap}
        {...rest}
      >
        {children}
      </motion.button>
    );
  },
);
