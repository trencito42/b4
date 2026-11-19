import { forwardRef, type ReactNode } from "react";

export interface ErrorStateProps {
  /** Illustration or icon. Rendered `aria-hidden` — the title carries the meaning. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Typically a `Button`, e.g. "Try again". */
  action?: ReactNode;
  className?: string;
}

const DefaultIcon = (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M24 6 44 40H4z" strokeLinejoin="round" />
    <path d="M24 19v9M24 32.5v.01" strokeLinecap="round" />
  </svg>
);

/**
 * A placeholder for a view that failed to load — distinct from
 * `EmptyState` (which signals "no data yet", not a failure). Uses
 * `role="alert"` since, unlike EmptyState, this is something assistive
 * tech should announce proactively. Composes inside `Card` or stands
 * alone in a page body.
 */
export const ErrorState = forwardRef<HTMLDivElement, ErrorStateProps>(function ErrorState(
  { icon = DefaultIcon, title, description, action, className },
  ref,
) {
  return (
    <div
      ref={ref}
      role="alert"
      className={["b4-error-state", className ?? ""].filter(Boolean).join(" ")}
    >
      <span className="b4-error-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="b4-error-state__title">{title}</p>
      {description && <p className="b4-error-state__description">{description}</p>}
      {action && <div className="b4-error-state__action">{action}</div>}
    </div>
  );
});
