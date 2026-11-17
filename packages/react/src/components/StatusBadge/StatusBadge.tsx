import type { ReactNode } from "react";

export type StatusBadgeStatus = "online" | "offline" | "degraded" | "idle";

export interface StatusBadgeProps {
  status: StatusBadgeStatus;
  /** The visible status label. Required — see DESIGN_PRINCIPLES.md's "color never carries meaning alone" rule; this component pairs a dot with text, never color alone. */
  children: ReactNode;
  className?: string;
}

const dotToneByStatus: Record<StatusBadgeStatus, string> = {
  online: "success",
  offline: "danger",
  degraded: "warning",
  idle: "neutral",
};

/**
 * A live-status indicator (connected/degraded/offline), distinct from the
 * static `Badge`. Always pairs a colored dot with an explicit text label —
 * there is no color-only variant, intentionally; a colorblind user or a
 * low-contrast display must still be able to tell the states apart from
 * the word alone.
 */
export function StatusBadge({ status, children, className }: StatusBadgeProps) {
  return (
    <span className={["b4-status-badge", className ?? ""].filter(Boolean).join(" ")}>
      <span
        className={`b4-status-badge__dot b4-status-badge__dot--${dotToneByStatus[status]}`}
        aria-hidden="true"
      />
      <span className="b4-status-badge__label">{children}</span>
    </span>
  );
}
