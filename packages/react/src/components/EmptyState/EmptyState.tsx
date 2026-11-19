import { forwardRef, type ReactNode } from "react";

export interface EmptyStateProps {
  /** Illustration or icon. Rendered `aria-hidden` — the title carries the meaning. */
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  /** Typically a `Button`. */
  action?: ReactNode;
  className?: string;
}

const DefaultIcon = (
  <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <rect x="8" y="14" width="32" height="24" rx="3" strokeLinejoin="round" />
    <path d="M8 22h32" />
    <path d="M18 30h12" strokeLinecap="round" />
  </svg>
);

/**
 * A placeholder for a view with no data yet — distinct from `ErrorState`
 * (which signals something went wrong) and from `Skeleton` (which signals
 * data is still loading). Composes inside `Card` or stands alone in a
 * page body.
 */
export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(function EmptyState(
  { icon = DefaultIcon, title, description, action, className },
  ref,
) {
  return (
    <div ref={ref} className={["b4-empty-state", className ?? ""].filter(Boolean).join(" ")}>
      <span className="b4-empty-state__icon" aria-hidden="true">
        {icon}
      </span>
      <p className="b4-empty-state__title">{title}</p>
      {description && <p className="b4-empty-state__description">{description}</p>}
      {action && <div className="b4-empty-state__action">{action}</div>}
    </div>
  );
});
