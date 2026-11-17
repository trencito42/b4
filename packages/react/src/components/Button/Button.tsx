import { forwardRef, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { springs } from "@b4/motion";
import { useReducedMotion } from "@b4/motion";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Visual treatment. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Size scale, independent of the density token axis. Defaults to "md". */
  size?: ButtonSize;
  /** Shows a spinner in place of the leading icon and disables interaction. */
  loading?: boolean;
  /** Icon rendered before the label. Hidden while `loading`. */
  iconStart?: ReactNode;
  /** Icon rendered after the label. Hidden while `loading`. */
  iconEnd?: ReactNode;
  /** Button content. */
  children?: ReactNode;
}

/**
 * B4's foundational action control. Every other action component
 * (IconButton, SplitButton, ToggleButton) shares this component's variant/
 * size vocabulary and press-feedback motion so the action family reads as
 * one system.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      disabled = false,
      iconStart,
      iconEnd,
      children,
      className,
      type = "button",
      ...rest
    },
    ref,
  ) {
    const reducedMotion = useReducedMotion();
    const isDisabled = disabled || loading;

    const classNames = [
      "b4-button",
      `b4-button--${variant}`,
      `b4-button--${size}`,
      loading ? "b4-button--loading" : "",
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
        whileTap={
          reducedMotion || isDisabled ? undefined : { scale: 0.97 }
        }
        transition={springs.snap}
        {...rest}
      >
        {loading ? (
          <span className="b4-button__spinner" aria-hidden="true" />
        ) : (
          iconStart && (
            <span className="b4-button__icon b4-button__icon--start" aria-hidden="true">
              {iconStart}
            </span>
          )
        )}
        {children && <span className="b4-button__label">{children}</span>}
        {!loading && iconEnd && (
          <span className="b4-button__icon b4-button__icon--end" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </motion.button>
    );
  },
);
