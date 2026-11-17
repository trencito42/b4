import { forwardRef, useState, type ReactNode } from "react";
import { Field } from "@base-ui/react/field";
import { Input } from "@base-ui/react/input";

export interface SearchFieldProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  placeholder?: string;
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  className?: string;
}

const SearchIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="11" cy="11" r="7" />
    <path d="m20 20-3.5-3.5" strokeLinecap="round" />
  </svg>
);

const ClearIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M6 6l12 12M18 6 6 18" strokeLinecap="round" />
  </svg>
);

/**
 * `TextField` specialized for search: a leading magnifier (decorative) and
 * a trailing clear button that only appears once there's a value to clear
 * — same "interactive trailing control needs its own non-aria-hidden slot"
 * reasoning as `PasswordField`, see that component's doc comment.
 */
export const SearchField = forwardRef<HTMLInputElement, SearchFieldProps>(function SearchField(
  { label, hideLabel = false, hint, error, disabled = false, placeholder, value, defaultValue, onValueChange, className },
  ref,
) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");
  const currentValue = value ?? internalValue;
  const hasError = Boolean(error);

  function handleChange(next: string) {
    if (value === undefined) setInternalValue(next);
    onValueChange?.(next);
  }

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
      </Field.Label>
      <div
        className={["b4-text-field__control", hasError ? "b4-text-field__control--error" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        <span className="b4-text-field__icon" aria-hidden="true">
          {SearchIcon}
        </span>
        <Input
          ref={ref}
          type="search"
          disabled={disabled}
          placeholder={placeholder}
          value={currentValue}
          onValueChange={handleChange}
          className="b4-text-field__input"
        />
        {currentValue && (
          <button
            type="button"
            className="b4-text-field__action-button"
            onClick={() => handleChange("")}
            aria-label="Clear search"
          >
            {ClearIcon}
          </button>
        )}
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
