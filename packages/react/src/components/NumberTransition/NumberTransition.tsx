import { forwardRef, useRef } from "react";
import { TextTransition } from "../TextTransition/TextTransition.js";
import { TextMorph } from "../TextMorph/TextMorph.js";

export interface NumberTransitionProps {
  /** The numeric value to display. */
  value: number;
  /**
   * Formats the number for display. Defaults to the browser's locale
   * grouping (`Intl.NumberFormat`). Pass a custom formatter for currency,
   * percentages, fixed decimals, etc.
   */
  format?: (value: number) => string;
  /**
   * Transition mode:
   * - "vertical" (default): slides digits vertically based on increase/decrease direction
   * - "digits" / "morph": digit-aware text morphing using place-value continuity
   */
  mode?: "vertical" | "digits" | "morph";
  className?: string;
}

const defaultFormatter = new Intl.NumberFormat(undefined);

/**
 * A `TextTransition` specialized for numbers: the enter/exit direction is
 * derived automatically from whether the value went up or down (increase →
 * new digits enter from below, as if scrolling up past them; decrease →
 * the reverse), rather than being a prop the caller has to track — the
 * mission brief's "numeric changes" requirement. Formatting is pluggable
 * so this works for counts, currency, and percentages alike.
 */
export const NumberTransition = forwardRef<HTMLSpanElement, NumberTransitionProps>(function NumberTransition(
  {
    value,
    format = (n) => defaultFormatter.format(n),
    mode = "vertical",
    className,
  },
  ref,
) {
  if (mode === "digits" || mode === "morph") {
    return (
      <TextMorph
        ref={ref}
        value={format(value)}
        mode="numbers"
        className={["b4-number-transition", className ?? ""].filter(Boolean).join(" ")}
      />
    );
  }

  const previousValue = useRef(value);
  const direction = value >= previousValue.current ? "forward" : "backward";
  previousValue.current = value;

  return (
    <TextTransition
      ref={ref}
      value={format(value)}
      mode="vertical"
      direction={direction}
      className={["b4-number-transition", className ?? ""].filter(Boolean).join(" ")}
    />
  );
});
