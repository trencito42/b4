import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Field as BaseField } from "@base-ui/react/field";
import { Field } from "../Field/Field.js";

export interface TextareaProps
  extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, "value" | "defaultValue"> {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  value?: string;
  defaultValue?: string;
}

/**
 * Multi-line counterpart to `TextField`, sharing its `Field` wrapper.
 * Built with `BaseField.Control`'s `render` prop pointed at a native
 * `<textarea>` — Base UI's documented pattern for using Field with a
 * control other than its default `<input>`.
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hideLabel, hint, error, disabled = false, required = false, className, rows = 4, ...rest },
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
          "b4-text-field__control--textarea",
          hasError ? "b4-text-field__control--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <BaseField.Control
          render={<textarea ref={ref} rows={rows} className="b4-text-field__input" {...rest} />}
          disabled={disabled}
          required={required}
        />
      </div>
    </Field>
  );
});
