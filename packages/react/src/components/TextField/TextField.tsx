import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Input } from "@base-ui/react/input";
import { Field } from "../Field/Field.js";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue"> {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  size?: TextFieldSize;
  startIcon?: ReactNode;
  endIcon?: ReactNode;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
}

/**
 * The base text-entry field every other Family B text input (Textarea,
 * PasswordField, SearchField, NumberField) extends or composes. Built on
 * the shared `Field` wrapper + Base UI's `Input` (which stays in sync
 * with `Field`'s validity state automatically).
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hideLabel,
    hint,
    error,
    size = "md",
    startIcon,
    endIcon,
    disabled = false,
    required = false,
    className,
    onValueChange,
    ...rest
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
      <div
        className={[
          "b4-text-field__control",
          `b4-text-field__control--${size}`,
          hasError ? "b4-text-field__control--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        {startIcon && <span className="b4-text-field__icon" aria-hidden="true">{startIcon}</span>}
        <Input
          ref={ref}
          disabled={disabled}
          required={required}
          onValueChange={onValueChange}
          className="b4-text-field__input"
          {...rest}
        />
        {endIcon && <span className="b4-text-field__icon" aria-hidden="true">{endIcon}</span>}
      </div>
    </Field>
  );
});
