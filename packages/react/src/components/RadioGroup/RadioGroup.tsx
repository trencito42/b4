import type { ReactNode } from "react";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";

export interface RadioGroupItem<Value extends string> {
  value: Value;
  label: ReactNode;
  disabled?: boolean;
}

export interface RadioGroupProps<Value extends string> {
  items: readonly RadioGroupItem<Value>[];
  value?: Value;
  defaultValue?: Value;
  onValueChange?: (value: Value) => void;
  disabled?: boolean;
  /** Required — the group has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * Built on Base UI's `RadioGroup` + `Radio.Root`/`Radio.Indicator` — real
 * roving-tabindex arrow-key navigation and ARIA radiogroup semantics, the
 * same category of behavior SegmentedControl gets from `ToggleGroup`.
 * Use `RadioGroup` for a vertical list of mutually-exclusive form choices;
 * use `SegmentedControl` when the choices are a compact inline switch
 * (view modes, time ranges) rather than a form field.
 */
export function RadioGroup<Value extends string>({
  items,
  value,
  defaultValue,
  onValueChange,
  disabled = false,
  className,
  ...rest
}: RadioGroupProps<Value>) {
  return (
    <BaseRadioGroup
      value={value}
      defaultValue={defaultValue}
      onValueChange={(next) => onValueChange?.(next as Value)}
      disabled={disabled}
      className={["b4-radio-group", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      {items.map((item) => (
        <label
          key={item.value}
          className="b4-radio-group__item"
          data-disabled={item.disabled || disabled || undefined}
        >
          <Radio.Root value={item.value} disabled={item.disabled} className="b4-radio-group__control">
            <Radio.Indicator className="b4-radio-group__dot" />
          </Radio.Root>
          <span className="b4-radio-group__label">{item.label}</span>
        </label>
      ))}
    </BaseRadioGroup>
  );
}
