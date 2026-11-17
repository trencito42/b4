import { useId, useState, type ReactNode } from "react";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { AnimatedIndicator } from "../AnimatedIndicator/AnimatedIndicator.js";

export interface SegmentedControlItem<Value extends string> {
  value: Value;
  label: ReactNode;
  disabled?: boolean;
}

export interface SegmentedControlProps<Value extends string> {
  items: readonly SegmentedControlItem<Value>[];
  /** Controlled selected value. */
  value?: Value;
  /** Uncontrolled initial selected value. */
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  /** Required — the control has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * B4's reference motion component: a sculptural capsule that physically
 * travels to the selected segment (the "Changelog/Login" pattern named in
 * the mission brief). Single-select only — Base UI's ToggleGroup also
 * supports `multiple`, which SegmentedControl deliberately does not expose;
 * use a ButtonGroup of ToggleButtons for a multi-select row instead.
 *
 * Selection state is lifted into this component (not read back from Base
 * UI's internal Toggle state) specifically so the indicator's "which item
 * is it in right now" decision happens at the same render as everything
 * else. The indicator itself is `AnimatedIndicator` — the shared traveling-
 * surface primitive — conditionally rendered inside whichever Toggle
 * currently matches `selected` (never more than one at a time, by
 * construction).
 */
export function SegmentedControl<Value extends string>({
  items,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  size = "md",
  className,
  ...rest
}: SegmentedControlProps<Value>) {
  const indicatorId = useId();
  const [internalValue, setInternalValue] = useState<Value | undefined>(
    defaultValue ?? items[0]?.value,
  );
  const selected = value ?? internalValue;

  function handleValueChange(next: readonly string[]) {
    const first = next[0] as Value | undefined;
    if (first === undefined) return;
    if (value === undefined) setInternalValue(first);
    onValueChange?.(first);
  }

  return (
    <ToggleGroup
      value={selected !== undefined ? [selected] : []}
      onValueChange={handleValueChange}
      disabled={disabled}
      className={["b4-segmented-control", `b4-segmented-control--${size}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {items.map((item) => {
        const isSelected = item.value === selected;
        return (
          <Toggle
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="b4-segmented-control__item"
          >
            {isSelected && (
              <AnimatedIndicator
                layoutId={`b4-segmented-indicator-${indicatorId}`}
                className="b4-segmented-control__indicator"
              />
            )}
            <span className="b4-segmented-control__label">{item.label}</span>
          </Toggle>
        );
      })}
    </ToggleGroup>
  );
}
