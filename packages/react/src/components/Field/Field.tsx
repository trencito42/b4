import type { ReactNode } from "react";
import { Field as BaseField } from "@base-ui/react/field";

export interface FieldProps {
  /** The visible field label. Always required — an input with no programmatic label is an accessibility defect, not a style choice. */
  label: ReactNode;
  /** Visually hides `label` while keeping it in the accessibility tree. */
  hideLabel?: boolean;
  hint?: ReactNode;
  /** When set, renders as an error and shows this message instead of `hint`. */
  error?: ReactNode;
  required?: boolean;
  disabled?: boolean;
  className?: string;
  /** The field's control markup — an input, textarea, or any custom control. */
  children: ReactNode;
}

/**
 * The shared label/hint/error wrapper every Family B input composes,
 * built on Base UI's `Field` (`Field.Root`/`Label`/`Description`/`Error`).
 * `TextField`, `Textarea`, `PasswordField`, and `SearchField` all used to
 * inline this exact composition independently — extracted here once a
 * fifth input (`NumberField`) was about to copy it a fifth time. If you're
 * building a new Family B input, use this instead of re-inlining Base
 * UI's `Field` parts (see AGENTS.md's reuse rule).
 *
 * **The label only auto-associates with a Base-UI-aware control** — Base
 * UI's `Input`/`Checkbox`/`Switch`/etc., or your own element rendered via
 * `BaseField.Control`'s `render` prop (see `Textarea`'s source for the
 * pattern with a plain `<textarea>`). Passing a bare native element as
 * `children` directly does **not** get the label/id wiring for free —
 * confirmed by `Field.test.tsx` using `BaseField.Control` with a native
 * select. That adapter supplies semantics, not visual dropdown styling.
 * For a B4 dropdown use `Select`, which already composes this wrapper;
 * see `Field.stories.tsx`. Do not nest another Field around Select.
 *
 * `Field.Error`'s `match` prop is passed literally `true` (not left to
 * native HTML5 validity) so this component's own `error` prop is what
 * decides visibility — the error message is swapped in for the hint
 * rather than both ever being shown at once.
 */
export function Field({
  label,
  hideLabel = false,
  hint,
  error,
  required = false,
  disabled = false,
  className,
  children,
}: FieldProps) {
  const hasError = Boolean(error);

  return (
    <BaseField.Root
      invalid={hasError}
      disabled={disabled}
      className={["b4-text-field", className ?? ""].filter(Boolean).join(" ")}
    >
      <BaseField.Label
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
      </BaseField.Label>
      {children}
      {hasError ? (
        <BaseField.Error match className="b4-text-field__message b4-text-field__message--error">
          {error}
        </BaseField.Error>
      ) : (
        hint && <BaseField.Description className="b4-text-field__message">{hint}</BaseField.Description>
      )}
    </BaseField.Root>
  );
}
