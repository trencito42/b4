import { forwardRef, type ReactNode } from "react";
import { OTPField } from "@base-ui/react/otp-field";
import { Field } from "../Field/Field.js";

export type InputOTPSize = "sm" | "md" | "lg";
/** Which characters a slot accepts. `numeric` also sets a numeric virtual keyboard on mobile. */
export type InputOTPValidationType = "numeric" | "alpha" | "alphanumeric" | "none";

export interface InputOTPProps {
  /** Visible field label. Required — a code input with no programmatic label is an accessibility defect. */
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  /** When set, renders as an error and replaces the hint. */
  error?: ReactNode;
  /** Number of slots. @default 6 */
  length?: number;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Fired once every slot is filled — the usual place to submit the code. */
  onComplete?: (value: string) => void;
  /** Character set accepted. @default "numeric" */
  validationType?: InputOTPValidationType;
  /** Obscure the entered characters, for codes that should not be shoulder-surfed. @default false */
  mask?: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  /** Submits the owning form as soon as the code completes. @default false */
  autoSubmit?: boolean;
  /** Name for form submission. */
  name?: string;
  size?: InputOTPSize;
  /** Insert a visual gap after this many slots (e.g. 3 renders "123 456"). */
  groupEvery?: number;
  className?: string;
}

/**
 * A verification-code (one-time passcode) field.
 *
 * Built on Base UI's `OTPField`, deliberately rather than hand-rolling
 * per-slot inputs. The brief's warning about this component is the exact
 * failure mode a naive implementation hits: independent `<input>`s with
 * manual focus juggling break paste, screen readers and password-manager
 * autofill. The primitive instead renders real slot inputs *plus* a
 * hidden validation input carrying `autocomplete="one-time-code"`, and
 * owns the hard parts — contiguous multi-character paste, backspace and
 * delete across slot boundaries, focus movement, clamping to `length`,
 * and rejecting characters outside `validationType`. This component
 * contributes B4's `Field` wrapper, geometry and tokens on top.
 *
 * The entered value is never logged, and `mask` renders the characters
 * obscured without changing the value the form submits.
 */
export const InputOTP = forwardRef<HTMLDivElement, InputOTPProps>(function InputOTP(
  {
    label,
    hideLabel,
    hint,
    error,
    length = 6,
    value,
    defaultValue,
    onValueChange,
    onComplete,
    validationType = "numeric",
    mask = false,
    disabled = false,
    readOnly = false,
    required = false,
    autoSubmit = false,
    name,
    size = "md",
    groupEvery,
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
      <OTPField.Root
        ref={ref}
        length={length}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next)}
        onValueComplete={(next) => onComplete?.(next)}
        validationType={validationType}
        mask={mask}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoSubmit={autoSubmit}
        name={name}
        className={["b4-input-otp", `b4-input-otp--${size}`].join(" ")}
        data-invalid={hasError || undefined}
      >
        {Array.from({ length }, (_, index) => (
          <OTPField.Input
            key={index}
            className="b4-input-otp__slot"
            // A gap after every `groupEvery` slots, except after the last
            // one — purely visual grouping ("123 456"); it never splits
            // the value or interrupts paste, which the primitive keeps
            // contiguous across all slots regardless.
            data-group-end={
              groupEvery && (index + 1) % groupEvery === 0 && index !== length - 1 ? "" : undefined
            }
          />
        ))}
      </OTPField.Root>
    </Field>
  );
});
