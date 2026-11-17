import { forwardRef, type ReactNode } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Field } from "../Field/Field.js";

export interface NumberFieldProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  min?: number;
  max?: number;
  step?: number;
  value?: number | null;
  defaultValue?: number;
  onValueChange?: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

const MinusIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3 8h10" strokeLinecap="round" />
  </svg>
);

const PlusIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
  </svg>
);

/**
 * Built on Base UI's full `NumberField` (`Root`/`Group`/`Input`/
 * `Increment`/`Decrement`) rather than a plain `TextField` with
 * `type="number"` — gives real value clamping to `min`/`max`, keyboard
 * arrow-key stepping, and press-and-hold stepping on the buttons for
 * free. Shares the `Field` wrapper like the rest of Family B's text
 * inputs. `NumberFieldInput` only gets a programmatic name from the
 * surrounding `Field.Label` (not from an `aria-label` on the input
 * itself) — composing it inside `Field` is what makes that work, same
 * reasoning as `Field.tsx`'s doc comment on bare children.
 */
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(function NumberField(
  {
    label,
    hideLabel,
    hint,
    error,
    required = false,
    disabled = false,
    min,
    max,
    step,
    value,
    defaultValue,
    onValueChange,
    placeholder,
    className,
  },
  ref,
) {
  const hasError = Boolean(error);

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      required={required}
      disabled={disabled}
      className={className}
    >
      <BaseNumberField.Root
        min={min}
        max={max}
        step={step}
        value={value}
        defaultValue={defaultValue}
        onValueChange={onValueChange}
        disabled={disabled}
        required={required}
      >
        <BaseNumberField.Group
          className={["b4-text-field__control", hasError ? "b4-text-field__control--error" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <BaseNumberField.Decrement className="b4-text-field__action-button" aria-label="Decrease value">
            {MinusIcon}
          </BaseNumberField.Decrement>
          <BaseNumberField.Input
            ref={ref}
            placeholder={placeholder}
            className="b4-text-field__input b4-number-field__input"
          />
          <BaseNumberField.Increment className="b4-text-field__action-button" aria-label="Increase value">
            {PlusIcon}
          </BaseNumberField.Increment>
        </BaseNumberField.Group>
      </BaseNumberField.Root>
    </Field>
  );
});
