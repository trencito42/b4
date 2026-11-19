import { forwardRef, type ReactNode } from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";

export interface CircularProgressProps {
  label: ReactNode;
  hideLabel?: boolean;
  /** `null` renders an indeterminate (unknown-duration) spinner ring. */
  value: number | null;
  min?: number;
  max?: number;
  /** Diameter in px. @default 48 */
  size?: number;
  strokeWidth?: number;
  showValue?: boolean;
  className?: string;
}

/**
 * The circular counterpart to `Progress` — same real Base UI
 * `Progress.Root` for ARIA semantics (`role="progressbar"`, a real
 * `aria-valuenow`/formatted value, a real indeterminate state), a
 * genuine SVG `stroke-dashoffset` ring rather than a CSS `conic-
 * gradient` approximation or a rotating border trick.
 */
export const CircularProgress = forwardRef<HTMLDivElement, CircularProgressProps>(function CircularProgress(
  {
    label,
    hideLabel = false,
    value,
    min = 0,
    max = 100,
    size = 48,
    strokeWidth = 4,
    showValue = false,
    className,
  },
  ref,
) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = value === null ? null : Math.min(1, Math.max(0, (value - min) / (max - min)));
  const dashoffset = percentage === null ? circumference * 0.75 : circumference * (1 - percentage);

  return (
    <BaseProgress.Root
      ref={ref}
      value={value}
      min={min}
      max={max}
      className={["b4-circular-progress", className ?? ""].filter(Boolean).join(" ")}
    >
      <div className="b4-circular-progress__ring-wrap" style={{ width: size, height: size }}>
        <svg viewBox={`0 0 ${size} ${size}`} width={size} height={size} className="b4-circular-progress__svg">
          <circle
            className="b4-circular-progress__track"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
          />
          <circle
            className="b4-circular-progress__indicator"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
          />
        </svg>
        {showValue && value !== null && (
          <BaseProgress.Value className="b4-circular-progress__value" />
        )}
      </div>
      <BaseProgress.Label className={["b4-circular-progress__label", hideLabel ? "b4-circular-progress__label--hidden" : ""].filter(Boolean).join(" ")}>
        {label}
      </BaseProgress.Label>
    </BaseProgress.Root>
  );
});
