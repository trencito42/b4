import { useId, type ReactNode } from "react";
import { ToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";
import { AnimatedIndicator } from "../AnimatedIndicator/AnimatedIndicator.js";
import { useControllableState } from "../../hooks/useControllableState.js";
import { usePointerSelection } from "../../hooks/usePointerSelection.js";

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
  /** Whether drag-to-select pointer scrubbing is enabled. Defaults to true. */
  scrub?: boolean;
  /** Required — the control has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * B4's reference motion component: a sculptural capsule that physically
 * travels to the selected segment (the "Changelog/Login" pattern named in
 * the mission brief).
 *
 * Supports fluid pointer scrubbing (drag-to-select) across segments:
 * dragging tracks the indicator across candidate options, with live preview
 * and natural settling on commit via B4's shared motion rules.
 */
export function SegmentedControl<Value extends string>({
  items,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  size = "md",
  scrub = true,
  className,
  ...rest
}: SegmentedControlProps<Value>) {
  const indicatorId = useId();

  const [committedValue, setCommittedValue] = useControllableState<Value>({
    value,
    defaultValue: defaultValue ?? (items[0]?.value as Value),
    onChange: onValueChange,
  });

  const { displayValue, isScrubbing, containerProps } = usePointerSelection<Value>({
    items,
    value: committedValue ?? (items[0]?.value as Value),
    onCommit: (next) => setCommittedValue(next),
    disabled,
    enabled: scrub,
    orientation: "horizontal",
  });

  function handleBaseUIValueChange(next: readonly string[]) {
    // When scrubbing is active, commit is owned by pointer release
    if (isScrubbing) return;
    const first = next[0] as Value | undefined;
    if (first === undefined) return;
    setCommittedValue(first);
  }

  const { style: gestureStyle, ...gestureHandlers } = containerProps;

  return (
    <ToggleGroup
      value={displayValue !== undefined ? [displayValue] : []}
      onValueChange={handleBaseUIValueChange}
      disabled={disabled}
      className={["b4-segmented-control", `b4-segmented-control--${size}`, className ?? ""]
        .filter(Boolean)
        .join(" ")}
      style={gestureStyle}
      {...gestureHandlers}
      {...rest}
    >
      {items.map((item) => {
        const isSelected = item.value === displayValue;
        return (
          <Toggle
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            data-b4-segment-value={item.value}
            className="b4-segmented-control__item"
          >
            {isSelected && (
              <AnimatedIndicator
                layoutId={`b4-segmented-indicator-${indicatorId}`}
                // Without this, Motion's `layout` projection treats ANY
                // re-render that changes this element's box as something
                // to FLIP-animate — including a resize caused by an
                // unrelated density/radius/contrast token change on a
                // distant ancestor, which doesn't unmount this indicator
                // (same selected item, same React instance). The result
                // was every OTHER segmented control's indicator visibly
                // chasing its new size/position whenever you touched any
                // one of the Studio header's configurator controls — "the
                // dots jump." Gating on `displayValue` means Motion only
                // treats it as a real layout change (worth animating)
                // when the selection itself changes; a pure external
                // resize now just follows the instant CSS reflow.
                layoutDependency={displayValue}
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
