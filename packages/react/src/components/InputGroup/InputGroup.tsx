import type { ReactNode } from "react";
import { Field } from "../Field/Field.js";

export interface InputGroupProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  /** Static or interactive content before the input, e.g. `"https://"` or a unit `Select`. */
  startAddon?: ReactNode;
  /** Static or interactive content after the input, e.g. `".com"` or a currency `Select`. */
  endAddon?: ReactNode;
  /** The input itself — a Base UI `Input` (or anything routed through `Field.Control`, see `Field.tsx`'s doc comment) so the label association still works. */
  children: ReactNode;
  className?: string;
}

/**
 * Joins a text/interactive addon with an input inside one visual control
 * box — a domain prefix ("https://"), a currency/unit selector, a fixed
 * suffix. Unlike `TextField`'s `startIcon`/`endIcon` (decorative-only,
 * `aria-hidden`), `InputGroup`'s addons can be interactive (e.g. a
 * `Select` for picking a unit) — they're real DOM siblings of the input,
 * not hidden from assistive tech.
 */
export function InputGroup({
  label,
  hideLabel,
  hint,
  error,
  disabled = false,
  required = false,
  startAddon,
  endAddon,
  children,
  className,
}: InputGroupProps) {
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
        className={["b4-text-field__control", hasError ? "b4-text-field__control--error" : ""]
          .filter(Boolean)
          .join(" ")}
      >
        {startAddon && <span className="b4-input-group__addon">{startAddon}</span>}
        {children}
        {endAddon && <span className="b4-input-group__addon">{endAddon}</span>}
      </div>
    </Field>
  );
}
