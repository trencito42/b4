import { useRef } from "react";
import { TextTransition } from "../TextTransition/TextTransition.js";

export interface NumberTransitionProps {
  /** The numeric value to display. */
  value: number;
  /**
   * Formats the number for display. Defaults to the browser's locale
   * grouping (`Intl.NumberFormat`). Pass a custom formatter for currency,
   * percentages, fixed decimals, etc.
   */
  format?: (value: number) => string;
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
export function NumberTransition({
  value,
  format = (n) => defaultFormatter.format(n),
  className,
}: NumberTransitionProps) {
  // Mutating a ref during render to diff against the previous value is a
  // known simplification — it's correct for the normal render path but not
  // guaranteed under React's StrictMode double-render (the direction could
  // theoretically read a ref already advanced by a discarded render pass).
  // Acceptable here because a wrong *direction* only affects which way the
  // digits slide, never correctness of the displayed value. Revisit with
  // useSyncExternalStore or a reducer if this ever needs to be exact.
  const previousValue = useRef(value);
  const direction = value >= previousValue.current ? "forward" : "backward";
  previousValue.current = value;

  return (
    <TextTransition
      value={format(value)}
      mode="vertical"
      direction={direction}
      className={className}
    />
  );
}
