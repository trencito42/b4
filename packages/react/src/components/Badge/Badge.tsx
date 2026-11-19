import { forwardRef, type ReactNode } from "react";

export type BadgeTone = "neutral" | "accent" | "success" | "warning" | "danger" | "info";

export interface BadgeProps {
  tone?: BadgeTone;
  children: ReactNode;
  className?: string;
}

/**
 * A static label chip — counts, tags, categories. For a badge that
 * represents a live status (connected/degraded/offline), use
 * `StatusBadge` instead, which pairs the color with an explicit state
 * label rather than color alone (see DESIGN_PRINCIPLES.md's "color never
 * carries meaning alone" rule).
 */
export const Badge = forwardRef<HTMLSpanElement, BadgeProps>(function Badge(
  { tone = "neutral", children, className },
  ref,
) {
  return (
    <span
      ref={ref}
      className={["b4-badge", `b4-badge--${tone}`, className ?? ""].filter(Boolean).join(" ")}
    >
      {children}
    </span>
  );
});
