import { forwardRef, useId, type ComponentPropsWithoutRef, type ReactNode } from "react";
import { Field } from "@base-ui/react/field";
import { mergeProps } from "@base-ui/react/merge-props";

interface PickerTriggerProps extends ComponentPropsWithoutRef<"button"> {
  startIcon?: ReactNode;
  placeholder?: boolean;
}

/** A form control that opens a picker and announces its label and current value. */
export const PickerTrigger = forwardRef<HTMLButtonElement, PickerTriggerProps>(
  function PickerTrigger(
    { children, startIcon, placeholder, disabled, className, ...props },
    ref,
  ) {
    const valueId = useId();
    return (
      <Field.Control
        ref={ref}
        disabled={disabled}
        render={(fieldProps) => (
          <button
            {...mergeProps<"button">(
              fieldProps as ComponentPropsWithoutRef<"button">,
              props,
            )}
            type="button"
            aria-labelledby={[fieldProps["aria-labelledby"], valueId]
              .filter(Boolean)
              .join(" ")}
            className={`b4-select ${className ?? ""}`.trimEnd()}
          >
            {startIcon}
            <span
              className="b4-select__value"
              id={valueId}
              data-placeholder={placeholder || undefined}
            >
              {children}
            </span>
            <span className="b4-select__icon" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </span>
          </button>
        )}
      />
    );
  },
);
