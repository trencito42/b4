import { forwardRef, type ReactNode } from "react";
import { useReducedMotion } from "@b4/motion";
import { Slider as BaseSlider } from "@base-ui/react/slider";
import { Field as BaseField } from "@base-ui/react/field";

export interface SliderProps {
  label: ReactNode;
  hint?: ReactNode;
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
export const Slider = forwardRef<HTMLDivElement, SliderProps>(function Slider({
  label,
  hint,
  disabled = false,
  min = 0,
  max = 100,
  step = 1,
  value,
  defaultValue,
  onValueChange,
  format = (v) => String(v),
  className,
}, ref) {
  const reducedMotion = useReducedMotion();
  const initial = value ?? defaultValue;
  const thumbCount = Array.isArray(initial) ? initial.length : 1;

  return (
    <BaseField.Root
      ref={ref}
      disabled={disabled}
      className={["b4-slider-field", className ?? ""].filter(Boolean).join(" ")}
    >
      <BaseSlider.Root
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        className="b4-slider"
        style={reducedMotion ? { transition: "none" } : undefined}
      >
        <div className="b4-slider-field__header">
          <BaseField.Label className="b4-slider-field__label">{label}</BaseField.Label>
          <BaseSlider.Value className="b4-slider-field__value">
            {(_formatted, values) => values.map((v) => format(v)).join(" – ")}
          </BaseSlider.Value>
        </div>
        <BaseSlider.Control className="b4-slider__control">
          <BaseSlider.Track className="b4-slider__track">
            <BaseSlider.Indicator className="b4-slider__indicator" />
            {Array.from({ length: thumbCount }, (_, i) => (
              <BaseSlider.Thumb key={i} className="b4-slider__thumb" style={reducedMotion ? { transition: "none" } : undefined} />
            ))}
          </BaseSlider.Track>
        </BaseSlider.Control>
      </BaseSlider.Root>
      {hint && <BaseField.Description className="b4-slider-field__hint">{hint}</BaseField.Description>}
    </BaseField.Root>
  );
});
