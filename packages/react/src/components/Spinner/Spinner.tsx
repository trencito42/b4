import { forwardRef } from "react";

export type SpinnerSize = "sm" | "md" | "lg";

export interface SpinnerProps {
  size?: SpinnerSize;
  /** Accessible label announced to screen readers. @default "Loading" */
  label?: string;
  className?: string;
}

/**
 * The standalone counterpart to `Button`'s own inline `loading` spinner
 * — same visual design (a `currentColor` border-spin circle), extracted
 * for use anywhere a loading state needs to show *without* being inside
 * a `Button` (a panel, a card, a page section). `role="status"` with an
 * `aria-label` announces the loading state once, the way a live region
 * should — not a wall of repeated "Loading" announcements on every
 * animation frame.
 */
export const Spinner = forwardRef<HTMLSpanElement, SpinnerProps>(function Spinner(
  { size = "md", label = "Loading", className },
  ref,
) {
  return (
    <span
      ref={ref}
      role="status"
      aria-label={label}
      className={["b4-spinner", `b4-spinner--${size}`, className ?? ""].filter(Boolean).join(" ")}
    >
      <span className="b4-spinner__circle" aria-hidden="true" />
    </span>
  );
});
