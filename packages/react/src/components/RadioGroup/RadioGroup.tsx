import { useId, type ReactNode } from "react";
import { motion } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";
import { AnimatedIndicator } from "../AnimatedIndicator/AnimatedIndicator.js";
import { motionCompatibleProps } from "../../internal/motionCompatibleProps.js";
import { RadioGroup as BaseRadioGroup } from "@base-ui/react/radio-group";
import { Radio } from "@base-ui/react/radio";
import { useControllableState } from "../../hooks/useControllableState.js";

export interface RadioGroupItem<Value extends string> {
  value: Value;
  label: ReactNode;
  description?: ReactNode;
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
  const indicatorId = useId();
  const reducedMotion = useReducedMotion();
  const [selected, setSelected] = useControllableState<Value | undefined>({
    value,
    defaultValue,
    onChange: onValueChange,
  });

  return (
    <BaseRadioGroup
      {...(value !== undefined ? { value } : defaultValue !== undefined ? { defaultValue } : {})}
      onValueChange={(next) => {
        setSelected(next as Value);
      }}
      disabled={disabled}
      className={["b4-radio-group", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      {items.map((item) => (
        <label
          key={item.value}
          className={[
            "b4-radio-group__item",
            item.value === selected ? "b4-radio-group__item--selected" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          data-disabled={item.disabled || disabled || undefined}
        >
          {item.value === selected && (
            <AnimatedIndicator
              as="span"
              layoutId={`b4-radio-selection-${indicatorId}`}
              className="b4-radio-group__selection"
              aria-hidden="true"
            />
          )}
          <Radio.Root
            value={item.value}
            disabled={item.disabled}
            className="b4-radio-group__control"
            render={
              <motion.span
                whileTap={
                  disabled || item.disabled || reducedMotion ? undefined : { scale: 0.9 }
                }
                transition={reducedMotion ? { duration: 0 } : springs.snap}
              />
            }
          >
            <Radio.Indicator
              keepMounted
              className="b4-radio-group__dot"
              render={(props, state) => (
                <motion.span
                  {...motionCompatibleProps(props)}
                  initial={false}
                  animate={{
                    scale: state.checked ? 1 : 0,
                    opacity: state.checked ? 1 : 0,
                  }}
                  transition={reducedMotion ? { duration: 0 } : springs.snap}
                />
              )}
            />
          </Radio.Root>
          <span className="b4-radio-group__content">
            <span className="b4-radio-group__label">{item.label}</span>
            {item.description && (
              <span className="b4-radio-group__description">{item.description}</span>
            )}
          </span>
        </label>
      ))}
    </BaseRadioGroup>
  );
}
