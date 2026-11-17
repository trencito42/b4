import { forwardRef, useRef, useState, type ReactNode } from "react";
import { Select as BaseSelect } from "@base-ui/react/select";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";
import { Field } from "../Field/Field.js";
import type { TextFieldSize } from "../TextField/TextField.js";

export interface MultiSelectItem {
  value: string;
  label: string;
  description?: string;
  disabled?: boolean;
}

export interface MultiSelectProps {
  label: ReactNode;
  hideLabel?: boolean;
  hint?: ReactNode;
  error?: ReactNode;
  items: readonly MultiSelectItem[];
  placeholder?: string;
  emptyMessage?: string;
  size?: TextFieldSize;
  value?: readonly string[];
  defaultValue?: readonly string[];
  onValueChange?: (value: string[]) => void;
  disabled?: boolean;
  required?: boolean;
  name?: string;
  id?: string;
  form?: string;
  className?: string;
}

/**
 * `Select` with `multiple` turned on — the same Base UI `Select.Root`
 * (which natively supports an array value and renders a checkmark per
 * selected item rather than one), not a second popup implementation.
 * The trigger shows a comma-joined summary of selected labels, or
 * "{n} selected" once more than two are chosen, to avoid an unbounded
 * one-line trigger — chip-per-item display is a possible follow-up, not
 * shipped here (see HANDOFF.md if you want to add it later).
 */
export const MultiSelect = forwardRef<HTMLButtonElement, MultiSelectProps>(
  function MultiSelect(
    {
      label,
      hideLabel,
      hint,
      error,
      items,
      placeholder = "Choose options",
      emptyMessage = "No options available",
      size = "md",
      value,
      defaultValue,
      onValueChange,
      disabled = false,
      required = false,
      name,
      id,
      form,
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
        <BaseSelect.Root<string, true>
          multiple
          items={items}
          value={value as string[] | undefined}
          defaultValue={defaultValue as string[] | undefined}
          onValueChange={(next) => onValueChange?.(next)}
          name={name}
          id={id}
          form={form}
          required={required}
          disabled={disabled}
          open={open}
          actionsRef={actionsRef}
          onOpenChange={(next, details) => {
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
            <BaseSelect.Value className="b4-select__value" placeholder={placeholder}>
              {(selected: string[]) => {
                if (!selected || selected.length === 0) return placeholder;
                if (selected.length <= 2) {
                  return selected
                    .map((v) => items.find((item) => item.value === v)?.label ?? v)
                    .join(", ");
                }
                return `${selected.length} selected`;
              }}
            </BaseSelect.Value>
            <BaseSelect.Icon className="b4-select__icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="m7 10 5 5 5-5" />
              </svg>
            </BaseSelect.Icon>
          </BaseSelect.Trigger>
          <BaseSelect.Portal>
            <BaseSelect.Positioner
              alignItemWithTrigger={false}
              sideOffset={() =>
                Number.parseFloat(
                  getComputedStyle(document.documentElement).getPropertyValue("--b4-space-2"),
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
                          <BaseSelect.ItemText render={<span />}>{item.label}</BaseSelect.ItemText>
                          {item.description && (
                            <span className="b4-select__description">{item.description}</span>
                          )}
                        </span>
                        <BaseSelect.ItemIndicator className="b4-select__check" keepMounted>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
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
  },
);
