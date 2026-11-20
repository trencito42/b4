import { forwardRef, type ReactNode } from "react";
import { ToggleGroup as BaseToggleGroup } from "@base-ui/react/toggle-group";
import { Toggle } from "@base-ui/react/toggle";

export type ToggleGroupSize = "sm" | "md" | "lg";
export type ToggleGroupOrientation = "horizontal" | "vertical";

export interface ToggleGroupItem<Value extends string> {
  value: Value;
  /** Visible content. For an icon-only item, pass the icon and set `label`. */
  children: ReactNode;
  /**
   * Accessible name. Required for icon-only items (where `children` carries
   * no text); optional otherwise, where the visible text already names it.
   */
  label?: string;
  disabled?: boolean;
}

export interface ToggleGroupProps<Value extends string> {
  items: readonly ToggleGroupItem<Value>[];
  /**
   * Pressed values. Always an array, in both modes — a single-select group
   * holds at most one entry. Controlled counterpart of `defaultValue`.
   */
  value?: readonly Value[];
  defaultValue?: readonly Value[];
  onValueChange?: (value: Value[]) => void;
  /** Allow more than one item pressed at a time. Defaults to false (single-select). */
  multiple?: boolean;
  disabled?: boolean;
  size?: ToggleGroupSize;
  orientation?: ToggleGroupOrientation;
  /** Wrap arrow-key focus from the last item back to the first. Defaults to true. */
  loop?: boolean;
  /** Required — the group has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * A group of related on/off buttons sharing one pressed state — toolbar
 * formatting (bold/italic/underline), view modes, filter toggles.
 *
 * Deliberately **not** `SegmentedControl`, which is the other grouped
 * control in B4 and is often confused with this one:
 *
 * - `SegmentedControl` is mutually-exclusive selection shown as one
 *   sculptural capsule with a travelling indicator. Exactly one segment
 *   is always chosen; choosing is the whole point. Use it for "which
 *   view am I in".
 * - `ToggleGroup` is a set of independent (or single-select) **buttons**
 *   that happen to be adjacent. Zero pressed items is a legitimate,
 *   common state, and `multiple` lets several be pressed at once. Use it
 *   for "which of these am I turning on".
 *
 * Built on Base UI's `ToggleGroup`, which already provides roving focus,
 * arrow-key navigation with optional looping, orientation and the
 * single/multiple semantics — per `AGENTS.md`'s reuse rule, this
 * component adds B4's geometry and tokens, not a second keyboard-
 * navigation manager. Items reuse `ToggleButton`'s exact visual
 * vocabulary (same control tokens, same pressed/hover/disabled
 * treatment) and `ButtonGroup`'s grouped-border geometry, so a
 * ToggleGroup item and a standalone ToggleButton read as the same
 * control in the same system.
 */
function ToggleGroupInner<Value extends string>(
  {
    items,
    value,
    defaultValue,
    onValueChange,
    multiple = false,
    disabled = false,
    size = "md",
    orientation = "horizontal",
    loop = true,
    className,
    ...rest
  }: ToggleGroupProps<Value>,
  ref: React.ForwardedRef<HTMLDivElement>,
) {
  return (
    <BaseToggleGroup<Value>
      ref={ref}
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next)}
      multiple={multiple}
      disabled={disabled}
      orientation={orientation}
      loopFocus={loop}
      className={[
        "b4-toggle-group",
        `b4-toggle-group--${size}`,
        `b4-toggle-group--${orientation}`,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
      {...rest}
    >
      {items.map((item) => (
        <Toggle
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          aria-label={item.label}
          className="b4-toggle-group__item"
        >
          {item.children}
        </Toggle>
      ))}
    </BaseToggleGroup>
  );
}

/**
 * `forwardRef` loses the generic, so it is re-applied here — the same
 * cast `SegmentedControl` would need; it keeps `items`/`value`/
 * `onValueChange` inferring one shared `Value` union at the call site
 * instead of widening to `string`.
 */
export const ToggleGroup = forwardRef(ToggleGroupInner) as <Value extends string>(
  props: ToggleGroupProps<Value> & { ref?: React.ForwardedRef<HTMLDivElement> },
) => ReturnType<typeof ToggleGroupInner>;
