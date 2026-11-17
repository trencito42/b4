import { forwardRef, useRef, useState, type ReactNode } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";
import { Field } from "../Field/Field.js";
import type { TextFieldSize } from "../TextField/TextField.js";

export interface SelectItem {
  /** Unique, stable form value. */
  value: string;
  /** Plain text also provides reliable keyboard typeahead. */
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface SelectProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  items: readonly SelectItem[];
  placeholder?: string;
  emptyMessage?: string;
  size?: TextFieldSize;
  value?: string | null;
  defaultValue?: string | null;
  onValueChange?: (value: string | null) => void;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  form?: string;
  autoComplete?: string;
  className?: string;
}

/**
 * Single choice with Base UI's keyboard/typeahead, form and positioning behavior.
 * Use Combobox for searchable collections; Select deliberately has no search input.
 * The forwarded ref points at the trigger. `null` clears a controlled selection.
 */
export const Select = forwardRef<HTMLButtonElement, SelectProps>(function Select(
  {
    label,
    hideLabel,
    hint,
    error,
    items,
    placeholder = "Choose an option",
    emptyMessage = "No options available",
    size = "md",
    value,
    defaultValue,
    onValueChange,
    disabled = false,
    readOnly = false,
    required = false,
    name,
    id,
    form,
    autoComplete,
    className,
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const actionsRef = useRef<BaseSelect.Root.Actions | null>(null);

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
      <BaseSelect.Root<string>
        items={items}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next)}
        name={name}
        id={id}
        form={form}
        autoComplete={autoComplete}
        required={required}
        disabled={disabled}
        readOnly={readOnly}
        open={open}
        actionsRef={actionsRef}
        onOpenChange={(next, details) => {
          // Retain the surface until Motion finishes its exit. A stale exit
          // must not unmount a popup reopened during the settling spring.
          if (!next && !reducedMotion) details.preventUnmountOnClose();
          openRef.current = next;
          setOpen(next);
        }}
      >
        <BaseSelect.Trigger
          ref={ref}
          aria-invalid={Boolean(error) || undefined}
          className={`b4-select b4-select--${size}`}
        >
          <BaseSelect.Value className="b4-select__value" placeholder={placeholder} />
          <BaseSelect.Icon className="b4-select__icon">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </BaseSelect.Icon>
        </BaseSelect.Trigger>
        <BaseSelect.Portal>
          <BaseSelect.Positioner
            alignItemWithTrigger={false}
            sideOffset={() =>
              Number.parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue(
                  "--b4-space-2",
                ),
              ) || 0
            }
            className="b4-select__positioner"
          >
            <BaseSelect.Popup
              className="b4-select__popup"
              render={
                <OptionPopupSurface
                  open={open}
                  onExitComplete={() => {
                    if (!openRef.current) actionsRef.current?.unmount();
                  }}
                />
              }
            >
              <BaseSelect.List className="b4-select__list">
                {items.length === 0 ? (
                  <div className="b4-select__empty" role="status">
                    {emptyMessage}
                  </div>
                ) : (
                  items.map((item) => (
                    <BaseSelect.Item
                      key={item.value}
                      value={item.value}
                      label={item.label}
                      disabled={item.disabled}
                      className="b4-select__item"
                    >
                      <span className="b4-select__item-content">
                        <BaseSelect.ItemText render={<span />}>
                          {item.label}
                        </BaseSelect.ItemText>
                        {item.description && (
                          <span className="b4-select__description">
                            {item.description}
                          </span>
                        )}
                      </span>
                      <BaseSelect.ItemIndicator className="b4-select__check" keepMounted>
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          aria-hidden="true"
                        >
                          <path d="m5 12 4 4 10-10" />
                        </svg>
                      </BaseSelect.ItemIndicator>
                    </BaseSelect.Item>
                  ))
                )}
              </BaseSelect.List>
            </BaseSelect.Popup>
          </BaseSelect.Positioner>
        </BaseSelect.Portal>
      </BaseSelect.Root>
    </Field>
  );
});
