import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";

export type IconButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type IconButtonSize = "sm" | "md" | "lg";

export interface IconButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: IconButtonVariant;
  size?: IconButtonSize;
  loading?: boolean;
  icon: ReactNode;
  /** Required — an icon-only button has no visible text for assistive tech to read. */
  "aria-label": string;
}

/**
 * Button's icon-only sibling: same variant/size vocabulary, same press
 * spring, but a square footprint sized to the control-height token instead
 * of Button's horizontal padding. Never render one without `aria-label` —
 * it's a required prop here, not an optional nicety, because there is no
 * other way for the action to be announced.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(
  function IconButton(
    { variant = "primary", size = "md", loading = false, disabled = false, icon, className, type = "button", ...rest },
    ref,
  ) {
    const reducedMotion = useReducedMotion();
    const isDisabled = disabled || loading;

    const classNames = [
      "b4-icon-button",
      `b4-icon-button--${variant}`,
      `b4-icon-button--${size}`,
      loading ? "b4-icon-button--loading" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    return (
      <motion.button
        ref={ref}
        type={type}
        className={classNames}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={loading || undefined}
        whileTap={reducedMotion || isDisabled ? undefined : { scale: 0.94 }}
        transition={springs.snap}
        {...rest}
      >
        {loading ? (
          <span className="b4-icon-button__spinner" aria-hidden="true" />
        ) : (
          <span className="b4-icon-button__icon" aria-hidden="true">
            {icon}
          </span>
        )}
      </motion.button>
    );
  },
);
