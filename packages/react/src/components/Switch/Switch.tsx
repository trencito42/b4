import { Switch as BaseSwitch } from "@base-ui/react/switch";
import type { ReactNode } from "react";

export interface SwitchProps {
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  label?: ReactNode;
  className?: string;
}

/**
 * Built on Base UI's `Switch.Root`/`Switch.Thumb`. Use `Switch` for
 * immediate-effect settings (dark mode, notifications on/off); use
 * `Checkbox` for form selections that need an explicit submit step —
 * they look different for a reason, not interchangeably.
 */
export function Switch({
  checked,
  defaultChecked,
  onCheckedChange,
  disabled = false,
  required = false,
  name,
  id,
  label,
  className,
  ...rest
}: SwitchProps & Record<`aria-${string}`, string | undefined>) {
  return (
    <label
      className={["b4-switch", className ?? ""].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
    >
      <BaseSwitch.Root
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className="b4-switch__track"
        {...rest}
      >
        <BaseSwitch.Thumb className="b4-switch__thumb" />
      </BaseSwitch.Root>
      {label && <span className="b4-switch__label">{label}</span>}
    </label>
  );
}
