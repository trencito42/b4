import { forwardRef, type MouseEvent, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { springs, useReducedMotion, useAsyncStatus, type AsyncStatus } from "@b4/motion";
import { TextTransition } from "../TextTransition/TextTransition.js";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "destructive";
export type ButtonSize = "sm" | "md" | "lg";
export type ButtonStatus = AsyncStatus;

export interface ButtonProps
  extends Omit<HTMLMotionProps<"button">, "children"> {
  /** Visual treatment. Defaults to "primary". */
  variant?: ButtonVariant;
  /** Size scale, independent of the density token axis. Defaults to "md". */
  size?: ButtonSize;
  /** Shows a spinner in place of the leading icon and disables interaction. Shorthand for status="pending". */
  loading?: boolean;
  /**
   * Explicit asynchronous action state ("idle" | "pending" | "success" | "error").
   * Drives choreographed icon, text, and tone transitions.
   */
  status?: ButtonStatus;
  /**
   * Status-specific label map. When provided and status changes, smoothly
   * transitions the label with soft blur/opacity crossfade and stable baseline.
   * Example: { idle: "Deploy app", pending: "Deploying…", success: "Deployed", error: "Retry" }
   */
  statusLabels?: Partial<Record<ButtonStatus, ReactNode>>;
  /**
   * Status-specific icon map. When provided, replaces the leading icon during the corresponding state.
   */
  statusIcons?: Partial<Record<ButtonStatus, ReactNode>>;
  /**
   * Optional async handler. When provided, Button manages its own status
   * lifecycle (pending -> success / error -> idle) automatically.
   */
  onAction?: () => Promise<unknown>;
  /** Auto-return to "idle" this many ms after success when using `onAction`. Defaults to 2000. */
  successDuration?: number;
  /** Auto-return to "idle" this many ms after error when using `onAction`. Defaults to 3000. */
  errorDuration?: number;
  /** Icon rendered before the label. Hidden while `loading` or when status icon is active. */
  iconStart?: ReactNode;
  /** Icon rendered after the label. Hidden while `loading` or when status is active. */
  iconEnd?: ReactNode;
  /** Button content. Used as the default label when statusLabels is not set or status is idle. */
  children?: ReactNode;
}

const SuccessCheckIcon = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
  </svg>
);

const ErrorAlertIcon = (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="8" />
    <circle cx="8" cy="11" r="0.5" fill="currentColor" />
  </svg>
);

/**
 * B4's foundational action control. Every other action component
 * (IconButton, SplitButton, ToggleButton) shares this component's variant/
 * size vocabulary and press-feedback motion so the action family reads as
 * one system.
 *
 * Supports full asynchronous action transformations (idle -> pending -> success / error)
 * with blur/crossfade label transitions, icon replacement, and tone adjustments.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      status: controlledStatus,
      statusLabels,
      statusIcons,
      onAction,
      successDuration = 2000,
      errorDuration = 3000,
      disabled = false,
      iconStart,
      iconEnd,
      children,
      className,
      type = "button",
      onClick,
      ...rest
    },
    ref,
  ) {
    const reducedMotion = useReducedMotion();
    const asyncRunner = useAsyncStatus({
      successDuration,
      errorDuration,
    });

    const currentStatus: ButtonStatus =
      controlledStatus ??
      (loading ? "pending" : onAction ? asyncRunner.status : "idle");

    const isPending = currentStatus === "pending";
    const isSuccess = currentStatus === "success";
    const isError = currentStatus === "error";
    const isDisabled = disabled || isPending;

    async function handleClick(event: MouseEvent<HTMLButtonElement>) {
      onClick?.(event);
      if (onAction && !event.defaultPrevented && !disabled && !isPending) {
        try {
          await asyncRunner.run(onAction);
        } catch {
          // Handled by asyncRunner status -> "error"
        }
      }
    }

    const activeLabel = statusLabels?.[currentStatus] ?? children;

    const classNames = [
      "b4-button",
      `b4-button--${variant}`,
      `b4-button--${size}`,
      isPending ? "b4-button--loading b4-button--status-pending" : "",
      isSuccess ? "b4-button--status-success" : "",
      isError ? "b4-button--status-error" : "",
      className ?? "",
    ]
      .filter(Boolean)
      .join(" ");

    let leadingIcon: ReactNode = null;
    if (isPending) {
      leadingIcon = statusIcons?.pending ?? (
        <span className="b4-button__spinner" aria-hidden="true" />
      );
    } else if (isSuccess) {
      leadingIcon = (
        <span className="b4-button__icon b4-button__icon--success" aria-hidden="true">
          {statusIcons?.success ?? SuccessCheckIcon}
        </span>
      );
    } else if (isError) {
      leadingIcon = (
        <span className="b4-button__icon b4-button__icon--error" aria-hidden="true">
          {statusIcons?.error ?? ErrorAlertIcon}
        </span>
      );
    } else if (iconStart) {
      leadingIcon = (
        <span className="b4-button__icon b4-button__icon--start" aria-hidden="true">
          {iconStart}
        </span>
      );
    }

    const showIconEnd = !isPending && !isSuccess && !isError && iconEnd;

    return (
      <motion.button
        ref={ref}
        type={type}
        className={classNames}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        aria-busy={isPending || undefined}
        onClick={handleClick}
        whileTap={
          reducedMotion || isDisabled ? undefined : { scale: 0.97 }
        }
        transition={springs.snap}
        {...rest}
      >
        {leadingIcon}
        {statusLabels && (typeof activeLabel === "string" || typeof activeLabel === "number") ? (
          <span className="b4-button__label">
            <TextTransition value={activeLabel} mode="crossfade" />
          </span>
        ) : (
          activeLabel && <span className="b4-button__label">{activeLabel}</span>
        )}
        {showIconEnd && (
          <span className="b4-button__icon b4-button__icon--end" aria-hidden="true">
            {iconEnd}
          </span>
        )}
      </motion.button>
    );
  },
);
