import { forwardRef, type ReactNode } from "react";

export interface ChartLegendItem {
  label: string;
  /** Any valid CSS color — typically one of `@b4/tokens`'s chart/accent scale. */
  color: string;
}

export interface ChartContainerProps {
  title: ReactNode;
  description?: ReactNode;
  /** Pairs each series' color with its label — see DESIGN_PRINCIPLES.md's "color never carries meaning alone" rule; the chart itself must never be the only place a series is identifiable by color. */
  legend?: ChartLegendItem[];
  /** Controls rendered next to the title, e.g. a period selector. */
  actions?: ReactNode;
  /** The chart itself — an SVG, a `<canvas>`, or another library's chart output. This component deliberately doesn't bundle a charting library (keeps this package's dependency footprint small); it provides the chrome, not the chart. */
  children: ReactNode;
  className?: string;
}

/**
 * The consistent chrome around a chart — title, description, an
 * accessible legend, and an actions slot — not a charting engine.
 * Composes with `Card` for a dashboard tile, or stands alone.
 */
export const ChartContainer = forwardRef<HTMLDivElement, ChartContainerProps>(function ChartContainer(
  { title, description, legend, actions, children, className },
  ref,
) {
  return (
    <div ref={ref} className={["b4-chart-container", className ?? ""].filter(Boolean).join(" ")}>
      <div className="b4-chart-container__header">
        <div className="b4-chart-container__heading">
          <p className="b4-chart-container__title">{title}</p>
          {description && <p className="b4-chart-container__description">{description}</p>}
        </div>
        {actions && <div className="b4-chart-container__actions">{actions}</div>}
      </div>
      <div className="b4-chart-container__chart">{children}</div>
      {legend && legend.length > 0 && (
        <ul className="b4-chart-container__legend">
          {legend.map((item) => (
            <li key={item.label} className="b4-chart-container__legend-item">
              <span
                className="b4-chart-container__legend-swatch"
                style={{ backgroundColor: item.color }}
                aria-hidden="true"
              />
              <span className="b4-chart-container__legend-label">{item.label}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
});
