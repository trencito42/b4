import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";

export type TextFieldSize = "sm" | "md" | "lg";

export interface TextFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "value" | "defaultValue"> {
  /** The visible field label. Always required — see DESIGN_PRINCIPLES.md; use `hideLabel` for a visually-hidden-but-present one. */
  label: ReactNode;
  /** Visually hides `label` while keeping it in the accessibility tree. */
  hideLabel?: boolean;
  hint?: ReactNode;
  /** When set, renders as an error and shows this message instead of `hint`. */
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
 * Base UI's `Field` (label/description/error wiring) + `Input` (the
 * actual `<input>`, which stays in sync with `Field`'s validity state
 * automatically). `label` is required, not optional — an input with no
 * programmatic label is an accessibility defect, not a style choice.
 */
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(function TextField(
  {
    label,
    hideLabel = false,
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
    <Field.Root
      disabled={disabled}
      className={["b4-text-field", className ?? ""].filter(Boolean).join(" ")}
    >
      <Field.Label className={["b4-text-field__label", hideLabel ? "b4-text-field__label--hidden" : ""].filter(Boolean).join(" ")}>
        {label}
        {required && (
          <span className="b4-text-field__required" aria-hidden="true">
            {" "}
            *
          </span>
        )}
      </Field.Label>
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
      {hasError ? (
        <Field.Error match className="b4-text-field__message b4-text-field__message--error">
          {error}
        </Field.Error>
      ) : (
        hint && <Field.Description className="b4-text-field__message">{hint}</Field.Description>
      )}
    </Field.Root>
  );
});
