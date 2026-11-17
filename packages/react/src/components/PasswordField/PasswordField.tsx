import { forwardRef, useState, type ReactNode } from "react";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";

export interface PasswordFieldProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  name?: string;
  id?: string;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  autoComplete?: string;
  className?: string;
}

const EyeIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path
      d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path
      d="M3 3l18 18M10.6 10.6a3 3 0 0 0 4.24 4.24M9.88 5.1A10.4 10.4 0 0 1 12 5c6.5 0 10 7 10 7a14.5 14.5 0 0 1-3.08 3.94M6.1 6.1A14.6 14.6 0 0 0 2 12s3.5 7 10 7c1.08 0 2.1-.16 3.03-.46"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/**
 * `TextField` with a masked value and a visibility toggle. Not built by
 * composing `TextField` directly — the toggle must be a real, keyboard-
 * reachable button, and `TextField`'s `endIcon` slot is intentionally
 * `aria-hidden` (decorative-only), so this duplicates `TextField`'s
 * structure with an interactive button in that slot instead. If a third
 * field needs an interactive trailing control, that's the point to
 * extract a shared "field with trailing action" structure rather than
 * duplicate it a third time — see HANDOFF.md.
 */
export const PasswordField = forwardRef<HTMLInputElement, PasswordFieldProps>(
  function PasswordField(
    {
      label,
      hideLabel = false,
      hint,
      error,
      required = false,
      disabled = false,
      name,
      id,
      placeholder,
      value,
      defaultValue,
      onValueChange,
      autoComplete,
      className,
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
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
          className={["b4-text-field__control", hasError ? "b4-text-field__control--error" : ""]
            .filter(Boolean)
            .join(" ")}
        >
          <Input
            ref={ref}
            type={visible ? "text" : "password"}
            disabled={disabled}
            required={required}
            name={name}
            id={id}
            placeholder={placeholder}
            value={value}
            defaultValue={defaultValue}
            onValueChange={onValueChange}
            autoComplete={autoComplete}
            className="b4-text-field__input"
          />
          <button
            type="button"
            className="b4-text-field__action-button"
            onClick={() => setVisible((v) => !v)}
            aria-label={visible ? "Hide password" : "Show password"}
            aria-pressed={visible}
          >
            {visible ? EyeOffIcon : EyeIcon}
          </button>
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
  },
);
