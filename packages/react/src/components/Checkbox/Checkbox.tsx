import { Checkbox as BaseCheckbox } from "@base-ui/react/checkbox";
import { forwardRef, type ReactNode } from "react";
import { motion } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";
import { motionCompatibleProps } from "../../internal/motionCompatibleProps.js";

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

/**
 * Built on Base UI's `Checkbox.Root`/`Checkbox.Indicator` for real
 * tri-state (checked/unchecked/indeterminate) semantics and keyboard/ARIA
 * behavior. Always renders with a visible label when `label` is passed —
 * a checkbox with only an icon and no text is an accessibility trap, so
 * this component requires either `label` or an explicit `aria-label`
 * (TypeScript doesn't enforce the "or" here; the axe check in
 * Checkbox.test.tsx does).
 */
export const Checkbox = forwardRef<
  HTMLButtonElement,
  CheckboxProps & Record<`aria-${string}`, string | undefined>
>(function Checkbox(
  {
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
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const transition = reducedMotion ? { duration: 0 } : springs.snap;
  return (
    <label
      className={["b4-checkbox", className ?? ""].filter(Boolean).join(" ")}
      data-disabled={disabled || undefined}
    >
      <BaseCheckbox.Root
        ref={ref}
        checked={checked}
        defaultChecked={defaultChecked}
        indeterminate={indeterminate}
        onCheckedChange={onCheckedChange}
        disabled={disabled}
        required={required}
        name={name}
        id={id}
        nativeButton
        className="b4-checkbox__box"
        render={(props, state) => (
          <motion.button
            {...motionCompatibleProps(props)}
            whileTap={state.disabled || reducedMotion ? undefined : { scale: 0.9 }}
            transition={transition}
          />
        )}
        {...rest}
      >
        <BaseCheckbox.Indicator
          keepMounted
          className="b4-checkbox__indicator"
          render={(props, state) => (
            <motion.span
              {...motionCompatibleProps(props)}
              aria-hidden="true"
              initial={false}
              animate={{
                scale: state.checked || indeterminate ? 1 : 0.6,
                opacity: state.checked || indeterminate ? 1 : 0,
              }}
              transition={transition}
            >
              <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
                <motion.path
                  initial={false}
                  animate={{
                    // Matching commands keep mixed-to-checked morphs continuous.
                    d: indeterminate ? "M4 8 8 8 12 8" : "M3.5 8.5 6.5 11.5 12.5 4.5",
                    pathLength: state.checked || indeterminate ? 1 : 0,
                  }}
                  transition={transition}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </motion.span>
          )}
        />
      </BaseCheckbox.Root>
      {label && <span className="b4-checkbox__label">{label}</span>}
    </label>
  );
});
