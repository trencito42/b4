import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from "react";
import { Field } from "@base-ui/react/field";

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
 * Multi-line counterpart to `TextField`, sharing its label/hint/error
 * composition on top of Base UI's `Field`. Built with `Field.Control`'s
 * `render` prop pointed at a native `<textarea>` — Base UI's documented
 * pattern for using Field with a control other than its default `<input>`
 * (see Base UI's Field docs: "you can omit [Field.Control] and use any
 * [...] component instead").
 */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  { label, hideLabel = false, hint, error, disabled = false, required = false, className, rows = 4, ...rest },
  ref,
) {
  const hasError = Boolean(error);

  return (
    <Field.Root
      disabled={disabled}
      className={["b4-text-field", className ?? ""].filter(Boolean).join(" ")}
    >
      <Field.Label
        className={["b4-text-field__label", hideLabel ? "b4-text-field__label--hidden" : ""]
          .filter(Boolean)
          .join(" ")}
      >
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
          "b4-text-field__control--textarea",
          hasError ? "b4-text-field__control--error" : "",
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Field.Control
          render={<textarea ref={ref} rows={rows} className="b4-text-field__input" {...rest} />}
          disabled={disabled}
          required={required}
        />
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
