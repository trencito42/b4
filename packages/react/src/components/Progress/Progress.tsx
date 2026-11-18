import type { ReactNode } from "react";
import { Progress as BaseProgress } from "@base-ui/react/progress";

export interface ProgressProps {
  label: ReactNode;
  hideLabel?: boolean;
  /** `null` renders an indeterminate (unknown-duration) progress bar. */
  value: number | null;
  min?: number;
  max?: number;
  /** Shows the formatted percentage/value beside the label. @default true, ignored when `value` is `null`. */
  showValue?: boolean;
  className?: string;
}

/**
 * A real Base UI `Progress` — genuine `role="progressbar"` semantics,
 * a formatted value announced to assistive tech, and a real
 * indeterminate state (`value={null}`, a looping animation, not a bar
 * frozen at a fake percentage) — not a styled `<div>` with a width
 * percentage and no ARIA semantics.
 */
export function Progress({ label, hideLabel = false, value, min = 0, max = 100, showValue = true, className }: ProgressProps) {
  return (
    <BaseProgress.Root
      value={value}
      min={min}
      max={max}
      className={["b4-progress", className ?? ""].filter(Boolean).join(" ")}
    >
      <div className="b4-progress__header">
        <BaseProgress.Label className={["b4-progress__label", hideLabel ? "b4-progress__label--hidden" : ""].filter(Boolean).join(" ")}>
          {label}
        </BaseProgress.Label>
        {showValue && value !== null && <BaseProgress.Value className="b4-progress__value" />}
      </div>
      <BaseProgress.Track className="b4-progress__track">
        <BaseProgress.Indicator className="b4-progress__indicator" />
      </BaseProgress.Track>
    </BaseProgress.Root>
  );
}
