import { forwardRef, type ReactNode } from "react";

export type StatTrendDirection = "up" | "down" | "neutral";

export interface StatTrend {
  /** Formatted delta text, e.g. "+12%" or "-3 today". */
  label: string;
  direction: StatTrendDirection;
}

export interface StatProps {
  label: ReactNode;
  value: ReactNode;
  description?: ReactNode;
  trend?: StatTrend;
  className?: string;
}

const TrendIcon = ({ direction }: { direction: StatTrendDirection }) => {
  if (direction === "neutral") {
    return (
      <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75}>
        <path d="M3.5 8h9" strokeLinecap="round" />
      </svg>
    );
  }
  const rotate = direction === "down" ? "rotate(180deg)" : undefined;
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} style={{ transform: rotate }}>
      <path d="M8 12.5V3.5M4 7.5 8 3.5l4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

/**
 * A single labeled metric with an optional trend delta. Composes inside
 * `Card` for a dashboard tile; doesn't render its own surface so it can
 * also sit directly in a denser stat grid.
 */
export const Stat = forwardRef<HTMLDivElement, StatProps>(function Stat(
  { label, value, description, trend, className },
  ref,
) {
  return (
    <div ref={ref} className={["b4-stat", className ?? ""].filter(Boolean).join(" ")}>
      <span className="b4-stat__label">{label}</span>
      <div className="b4-stat__value-row">
        <span className="b4-stat__value">{value}</span>
        {trend && (
          <span className={["b4-stat__trend", `b4-stat__trend--${trend.direction}`].join(" ")}>
            <span className="b4-stat__trend-icon" aria-hidden="true">
              <TrendIcon direction={trend.direction} />
            </span>
            {trend.label}
          </span>
        )}
      </div>
      {description && <span className="b4-stat__description">{description}</span>}
    </div>
  );
});
