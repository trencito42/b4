import { forwardRef, useMemo, useRef, useState } from "react";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useReducedMotion } from "@b4/motion";
import { Field } from "../Field/Field.js";
import type { SelectProps, SelectItem } from "../Select/Select.js";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";

export interface ComboboxProps extends Omit<SelectProps, "emptyMessage"> {
  emptyMessage?: string;
  clearLabel?: string;
  showOptionsLabel?: string;
  inputValue?: string;
  onInputValueChange?: (query: string) => void;
  /** Caller owns loading and request cancellation. Stale options cannot be selected. */
  loading?: boolean;
  loadingMessage?: string;
  /** Set to null when the server has already filtered the supplied items. */
  filter?: ((item: SelectItem, query: string) => boolean) | null;
}

/** Filterable single selection. Values are stable IDs, not item object identities.
 * Composes Field and Select's option-surface recipe; it is not free-form search.
 */
export const Combobox = forwardRef<HTMLInputElement, ComboboxProps>(function Combobox(
  {
    label,
    hideLabel,
    hint,
    error,
    items,
    placeholder = "Search options",
    emptyMessage = "No matching options",
    clearLabel = "Clear selection",
    showOptionsLabel = "Show options",
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
    inputValue,
    onInputValueChange,
    loading = false,
    loadingMessage = "Loading options",
    filter,
  },
  ref,
) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const actionsRef = useRef<BaseCombobox.Root.Actions | null>(null);
  const collection = useMemo(
    () =>
      BaseCombobox.createItems(items, {
        getValue: (item) => item.value,
        getLabel: (item) => item.label,
      }),
    [items],
  );

  return (
    <Field
      label={label}
      hideLabel={hideLabel}
      hint={hint}
      error={error}
      disabled={disabled}
      required={required}
      className={className}
    >
      <BaseCombobox.Root<string, false, SelectItem>
        items={collection}
        value={value}
        defaultValue={defaultValue}
        onValueChange={(next) => onValueChange?.(next)}
        inputValue={inputValue}
        onInputValueChange={(next) => onInputValueChange?.(next)}
        filter={filter}
        filteredItems={loading ? [] : undefined}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        name={name}
        form={form}
        autoComplete={autoComplete}
        open={open}
        actionsRef={actionsRef}
        onOpenChange={(next, details) => {
          if (!next && !reducedMotion) details.preventUnmountOnClose();
          openRef.current = next;
          setOpen(next);
        }}
      >
        <BaseCombobox.InputGroup className={`b4-combobox b4-combobox--${size}`}>
          <BaseCombobox.Input
            ref={ref}
            id={id}
            placeholder={placeholder}
            aria-busy={loading || undefined}
            className="b4-combobox__input"
          />
          <BaseCombobox.Clear
            aria-label={clearLabel}
            className="b4-text-field__action-button b4-combobox__action"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m7 7 10 10M17 7 7 17" />
            </svg>
          </BaseCombobox.Clear>
          <BaseCombobox.Trigger
            render={(props) => (
              <button
                {...props}
                aria-label={showOptionsLabel}
                aria-labelledby={undefined}
              />
            )}
            className="b4-text-field__action-button b4-combobox__action"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              aria-hidden="true"
            >
              <path d="m7 10 5 5 5-5" />
            </svg>
          </BaseCombobox.Trigger>
        </BaseCombobox.InputGroup>
        <BaseCombobox.Portal>
          <BaseCombobox.Positioner
            className="b4-select__positioner"
            sideOffset={() =>
              Number.parseFloat(
                getComputedStyle(document.documentElement).getPropertyValue(
                  "--b4-space-2",
                ),
              ) || 0
            }
          >
            <BaseCombobox.Popup
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
              <BaseCombobox.Empty className="b4-combobox__empty">
                {loading ? loadingMessage : emptyMessage}
              </BaseCombobox.Empty>
              <BaseCombobox.List className="b4-select__list">
                {(item: SelectItem) => (
                  <BaseCombobox.Item
                    key={item.value}
                    value={item.value}
                    disabled={item.disabled}
                    className="b4-select__item"
                  >
                    <span className="b4-select__item-content">
                      <span>{item.label}</span>
                      {item.description && (
                        <span className="b4-select__description">{item.description}</span>
                      )}
                    </span>
                    <BaseCombobox.ItemIndicator className="b4-select__check" keepMounted>
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                        aria-hidden="true"
                      >
                        <path d="m5 12 4 4 10-10" />
                      </svg>
                    </BaseCombobox.ItemIndicator>
                  </BaseCombobox.Item>
                )}
              </BaseCombobox.List>
            </BaseCombobox.Popup>
          </BaseCombobox.Positioner>
        </BaseCombobox.Portal>
      </BaseCombobox.Root>
    </Field>
  );
});
