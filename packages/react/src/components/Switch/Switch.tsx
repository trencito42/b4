import { Switch as BaseSwitch } from "@base-ui/react/switch";
import { forwardRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";
import { motionCompatibleProps } from "../../internal/motionCompatibleProps.js";

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
export const Switch = forwardRef<
  HTMLButtonElement,
  SwitchProps & Record<`aria-${string}`, string | undefined>
>(function Switch(
  {
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
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  return (
    <label
      className={["b4-switch", className ?? ""].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
    >
      <BaseSwitch.Root
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        className="b4-switch__track"
        render={(props, state) => (
          <motion.button
            {...motionCompatibleProps(props)}
            whileTap={state.disabled || reducedMotion ? undefined : { scale: 0.96 }}
            transition={reducedMotion ? { duration: 0 } : springs.snap}
          />
        )}
        {...rest}
      >
        <BaseSwitch.Thumb
          className="b4-switch__thumb"
          render={
            <motion.span
              initial={false}
              layout={reducedMotion ? false : "position"}
              transition={reducedMotion ? { duration: 0 } : springs.travel}
            />
          }
        />
      </BaseSwitch.Root>
      {label && <span className="b4-switch__label">{label}</span>}
    </label>
  );
});
