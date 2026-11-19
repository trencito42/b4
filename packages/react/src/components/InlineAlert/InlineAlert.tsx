import { forwardRef, type ReactNode } from "react";
import { IconButton } from "../IconButton/IconButton.js";

export type InlineAlertTone = "info" | "success" | "warning" | "danger";

export interface InlineAlertProps {
  tone?: InlineAlertTone;
  title?: ReactNode;
  children: ReactNode;
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

const iconByTone: Record<InlineAlertTone, ReactNode> = {
  info: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="M8 7.25v4M8 5.25v.01" strokeLinecap="round" />
    </svg>
  ),
  success: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="m5.25 8 1.9 1.9L10.75 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  warning: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <path d="M8 2.5 14.5 13.5h-13z" strokeLinejoin="round" />
      <path d="M8 6.5v3.25M8 11.75v.01" strokeLinecap="round" />
    </svg>
  ),
  danger: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
      <circle cx="8" cy="8" r="6.5" />
      <path d="m5.5 5.5 5 5m0-5-5 5" strokeLinecap="round" />
    </svg>
  ),
};

const toneLabel: Record<InlineAlertTone, string> = {
  info: "Info",
  success: "Success",
  warning: "Warning",
  danger: "Error",
};

/**
 * A persistent, page-level message — distinct from `Toast` (which is
 * transient and self-dismisses) and from `Badge`/`StatusBadge` (which
 * are small inline labels, not a full message block). Always pairs its
 * tone color with a distinct icon shape (info/success/warning/danger
 * each a genuinely different glyph, not the same circle recolored) —
 * see `DESIGN_PRINCIPLES.md`'s "color never carries meaning alone"
 * rule, already established by `StatusBadge`.
 */
export const InlineAlert = forwardRef<HTMLDivElement, InlineAlertProps>(function InlineAlert(
  { tone = "info", title, children, dismissible = false, onDismiss, className },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={["b4-inline-alert", `b4-inline-alert--${tone}`, className ?? ""].filter(Boolean).join(" ")}
    >
      <span className="b4-inline-alert__icon" aria-hidden="true">
        {iconByTone[tone]}
      </span>
      <div className="b4-inline-alert__body">
        <span className="b4-inline-alert__visually-hidden-tone">{toneLabel[tone]}: </span>
        {title && <p className="b4-inline-alert__title">{title}</p>}
        <div className="b4-inline-alert__message">{children}</div>
      </div>
      {dismissible && (
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Dismiss"
          icon={CloseIcon}
          className="b4-inline-alert__dismiss"
          onClick={onDismiss}
        />
      )}
    </div>
  );
});
