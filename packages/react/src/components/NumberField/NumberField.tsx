import { forwardRef, useRef, type ReactNode } from "react";
import { NumberField as BaseNumberField } from "@base-ui/react/number-field";
import { Field } from "../Field/Field.js";
import { FieldControl } from "../../internal/FieldControl.js";
import { SteppingInput } from "../../internal/SteppingInput.js";
import { IconButton } from "../IconButton/IconButton.js";
import { useReducedMotion } from "@b4/motion";
import { motionCompatibleProps } from "../../internal/motionCompatibleProps.js";

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
  onValueChange?: (
    value: number | null,
    details: BaseNumberField.Root.ChangeEventDetails,
  ) => void;
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
export const NumberField = forwardRef<HTMLInputElement, NumberFieldProps>(
  function NumberField(
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
    const reducedMotion = useReducedMotion();
    const stepChange = useRef(false);

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
          onValueChange={(next, details) => {
            stepChange.current = [
              "increment-press",
              "decrement-press",
              "keyboard",
              "scrub",
              "wheel",
            ].includes(details.reason);
            onValueChange?.(next, details);
          }}
          disabled={disabled}
          required={required}
        >
          <BaseNumberField.Group
            render={<FieldControl disabled={disabled} />}
            className={[
              "b4-text-field__control",
              hasError ? "b4-text-field__control--error" : "",
            ]
              .filter(Boolean)
              .join(" ")}
          >
            <BaseNumberField.Decrement
              render={(props, state) => (
                <IconButton
                  {...motionCompatibleProps(props)}
                  variant="ghost"
                  size="sm"
                  className="b4-field-action"
                  aria-label="Decrease value"
                  icon={MinusIcon}
                  whileTap={reducedMotion || state.disabled ? undefined : { scale: 0.9 }}
                />
              )}
            />
            <span className="b4-number-field__value">
              <BaseNumberField.Input
                ref={ref}
                placeholder={placeholder}
                className="b4-text-field__input b4-number-field__input"
                render={(props, state) => (
                  <SteppingInput
                    {...motionCompatibleProps(props)}
                    numericValue={state.value}
                    stepChange={stepChange.current}
                  />
                )}
              />
            </span>
            <BaseNumberField.Increment
              render={(props, state) => (
                <IconButton
                  {...motionCompatibleProps(props)}
                  variant="ghost"
                  size="sm"
                  className="b4-field-action"
                  aria-label="Increase value"
                  icon={PlusIcon}
                  whileTap={reducedMotion || state.disabled ? undefined : { scale: 0.9 }}
                />
              )}
            />
          </BaseNumberField.Group>
        </BaseNumberField.Root>
      </Field>
    );
  },
);
