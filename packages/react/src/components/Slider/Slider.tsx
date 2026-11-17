import { forwardRef, useId, type ReactNode } from "react";
import { springs, useReducedMotion } from "@b4/motion";
import { motion } from "motion/react";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { Field as BaseField } from "@base-ui/react/field";

export interface SliderProps {
  label: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  size?: "sm" | "md" | "lg";
  variant?: "primary" | "secondary";
  name?: string;
  form?: string;
  /** Accessible names for individual range thumbs. */
  thumbLabels?: readonly string[];
  onValueCommitted?: (value: number | number[]) => void;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  /** A single number for a plain slider, or an array (e.g. `[min, max]`) for a range slider — same component, same Base UI Root, see COMPONENT_INVENTORY.md's scope-changes log on Slider/RangeSlider. */
  value?: number | number[];
  defaultValue?: number | number[];
  onValueChange?: (value: number | number[]) => void;
  /** Formats each displayed value. */
  format?: (value: number) => string;
  className?: string;
}

/**
 * Covers both the mission brief's "Slider" and "RangeSlider" entries —
 * Base UI's own `Slider.Root` already takes either a `number` or a
 * `number[]` value and renders the matching number of thumbs, so a
 * second component would just be this one with an array value. Pass an
 * array to get a range slider; renders one `Slider.Thumb` per array
 * entry.
 */
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider(
  {
    label,
    hint,
    error,
    size = "md",
    variant = "secondary",
    name,
    form,
    thumbLabels,
    onValueCommitted,
    disabled = false,
    min = 0,
    max = 100,
    step = 1,
    value,
    defaultValue,
    onValueChange,
    format = (v) => String(v),
    className,
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const labelId = useId();
  const initial = value ?? defaultValue;
  const thumbCount = Array.isArray(initial) ? initial.length : 1;

  return (
    <BaseField.Root
      ref={ref}
      disabled={disabled}
      invalid={Boolean(error)}
      data-invalid={error ? "" : undefined}
      className={[
        "b4-slider-field",
        `b4-slider-field--${size}`,
        `b4-slider-field--${variant}`,
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <BaseSlider.Root
        aria-labelledby={labelId}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        onValueCommitted={onValueCommitted}
        name={name}
        form={form}
        disabled={disabled}
        data-invalid={error ? "" : undefined}
        min={min}
        max={max}
        step={step}
        className="b4-slider"
      >
        <div className="b4-slider-field__header">
          <BaseField.Label
            id={labelId}
            className="b4-text-field__label b4-slider-field__label"
          >
            {label}
          </BaseField.Label>
          <BaseSlider.Value className="b4-slider-field__value" aria-hidden="true">
            {(_formatted, values) => values.map((v) => format(v)).join(" – ")}
          </BaseSlider.Value>
        </div>
        <BaseSlider.Control className="b4-slider__control">
          <BaseSlider.Track className="b4-slider__track">
            <BaseSlider.Indicator className="b4-slider__indicator" />
            {Array.from({ length: thumbCount }, (_, i) => (
              <BaseSlider.Thumb
                key={i}
                index={i}
                className="b4-slider__thumb"
                aria-label={
                  thumbLabels?.[i] ??
                  (thumbCount > 1
                    ? thumbCount === 2
                      ? i === 0
                        ? "Minimum value"
                        : "Maximum value"
                      : `Value ${i + 1}`
                    : undefined)
                }
                aria-invalid={error ? true : undefined}
                getAriaValueText={(_text, current) => format(current)}
                render={
                  <motion.div
                    tabIndex={-1}
                    whileHover={disabled || reducedMotion ? undefined : { scale: 1.08 }}
                    whileTap={disabled || reducedMotion ? undefined : { scale: 1.14 }}
                    transition={reducedMotion ? { duration: 0 } : springs.snap}
                  />
                }
              />
            ))}
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
      {error ? (
        <BaseField.Error
          match
          className="b4-text-field__message b4-text-field__message--error"
        >
          {error}
        </BaseField.Error>
      ) : (
        hint && (
          <BaseField.Description className="b4-text-field__message">
            {hint}
          </BaseField.Description>
        )
      )}
    </BaseField.Root>
  );
});
