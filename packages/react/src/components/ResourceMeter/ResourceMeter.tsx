import { forwardRef, useId, type ReactNode } from "react";

export type ResourceMeterTone = "neutral" | "warning" | "danger";

export interface ResourceMeterProps {
  label: ReactNode;
  value: number;
  max?: number;
  /** Shown after the value, e.g. "GB" or "%". */
  unit?: string;
  /** Overrides the auto-computed tone (>=90% danger, >=75% warning, else neutral). */
  tone?: ResourceMeterTone;
  className?: string;
}

function autoTone(percentage: number): ResourceMeterTone {
  if (percentage >= 90) return "danger";
  if (percentage >= 75) return "warning";
  return "neutral";
}

/**
 * A current resource level (storage used, CPU, quota) — distinct from
 * `Progress` (Family D), which represents an in-progress *operation*,
 * not a static level. Uses ARIA's `meter` role on a custom-styled
 * element (not the native `<meter>`, whose cross-browser styling is
 * too inconsistent to theme reliably) for real semantics —
 * `aria-valuenow`/`min`/`max`/`valuetext`, not just a colored bar with
 * no machine-readable value.
 */
export const ResourceMeter = forwardRef<HTMLDivElement, ResourceMeterProps>(function ResourceMeter(
  { label, value, max = 100, unit, tone, className },
  ref,
) {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const resolvedTone = tone ?? autoTone(percentage);
  const formattedValue = unit ? `${value} ${unit}` : String(value);
  const formattedMax = unit ? `${max} ${unit}` : String(max);
  const labelId = useId();

  return (
    <div ref={ref} className={["b4-resource-meter", className ?? ""].filter(Boolean).join(" ")}>
      <div className="b4-resource-meter__header">
        <span id={labelId} className="b4-resource-meter__label">
          {label}
        </span>
        <span className="b4-resource-meter__value">
          {formattedValue} / {formattedMax}
        </span>
      </div>
      <div
        role="meter"
        aria-labelledby={labelId}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuetext={`${formattedValue} of ${formattedMax}`}
        className="b4-resource-meter__track"
      >
        <div
          className={`b4-resource-meter__fill b4-resource-meter__fill--${resolvedTone}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
});
