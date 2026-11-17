import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import type { ReactNode } from "react";

export interface CheckboxProps {
  checked?: boolean;
  defaultChecked?: boolean;
  indeterminate?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  /** The visible label. For a checkbox with no visible label, pass an `aria-label` instead and omit this. */
  label?: ReactNode;
  className?: string;
}

const CheckIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M3.5 8.5 6.5 11.5 12.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const IndeterminateIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 8h8" strokeLinecap="round" />
  </svg>
);

/**
 * Built on Base UI's `Checkbox.Root`/`Checkbox.Indicator` for real
 * tri-state (checked/unchecked/indeterminate) semantics and keyboard/ARIA
 * behavior. Always renders with a visible label when `label` is passed —
 * a checkbox with only an icon and no text is an accessibility trap, so
 * this component requires either `label` or an explicit `aria-label`
 * (TypeScript doesn't enforce the "or" here; the axe check in
 * Checkbox.test.tsx does).
 */
export function Checkbox({
  checked,
  defaultChecked,
  indeterminate = false,
  onCheckedChange,
  disabled = false,
  required = false,
  name,
  id,
  label,
  className,
  ...rest
}: CheckboxProps & Record<`aria-${string}`, string | undefined>) {
  return (
    <label
      className={["b4-checkbox", className ?? ""].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
    >
      <BaseCheckbox.Root
        checked={checked}
        defaultChecked={defaultChecked}
        indeterminate={indeterminate}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className="b4-checkbox__box"
        {...rest}
      >
        <BaseCheckbox.Indicator className="b4-checkbox__indicator">
          {indeterminate ? IndeterminateIcon : CheckIcon}
        </BaseCheckbox.Indicator>
      </BaseCheckbox.Root>
      {label && <span className="b4-checkbox__label">{label}</span>}
    </label>
  );
}
