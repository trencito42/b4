import { useMemo, useRef } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { Combobox as BaseCombobox } from "@base-ui/react/combobox";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";
import { KeyboardShortcut } from "../KeyboardShortcut/KeyboardShortcut.js";

export interface CommandPaletteItem {
  value: string;
  label: string;
  description?: string;
  shortcut?: readonly string[];
  disabled?: boolean;
}

export interface CommandPaletteProps {
  items: readonly CommandPaletteItem[];
  onSelect: (value: string) => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  placeholder?: string;
  emptyMessage?: string;
  /** Required — the dialog has no visible title, only the search input. */
  "aria-label": string;
}

/**
 * A real Base UI `Dialog` wrapping a real Base UI `Combobox` in its
 * documented `inline` mode (the list renders directly in the dialog,
 * not in its own floating popup — `Combobox.Root`'s own `inline` prop
 * exists for exactly this composition). `Combobox`'s `open`/
 * `onOpenChange` are bound to the same state as the `Dialog`'s, per
 * Base UI's own guidance, so the filter query and highlighted item
 * reset whenever the palette closes. This is fully controlled — a
 * command palette is normally opened by a global shortcut the consumer
 * owns (e.g. Cmd/Ctrl+K), not a visible trigger button.
 */
export function CommandPalette({
  items,
  onSelect,
  open,
  onOpenChange,
  placeholder = "Type a command or search…",
  emptyMessage = "No matching commands",
  ...rest
}: CommandPaletteProps) {
  const reducedMotion = useReducedMotion();
  const openRef = useRef(open);
  openRef.current = open;
  const actionsRef = useRef<BaseDialog.Root.Actions | null>(null);
  const collection = useMemo(
    () =>
      BaseCombobox.createItems(items, {
        getValue: (item) => item.value,
        getLabel: (item) => item.label,
      }),
    [items],
  );

  return (
    <BaseDialog.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, details) => {
        if (!next && !reducedMotion) details.preventUnmountOnClose();
        onOpenChange(next);
      }}
    >
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className="b4-command-palette__backdrop"
          render={<OptionPopupSurface open={open} onExitComplete={() => {}} />}
        />
        <BaseDialog.Popup
          className="b4-command-palette__popup"
          render={
            <OptionPopupSurface
              open={open}
              onExitComplete={() => {
                if (!openRef.current) actionsRef.current?.unmount();
              }}
            />
          }
          {...rest}
        >
          <BaseCombobox.Root<string, false, CommandPaletteItem>
            items={collection}
            inline
            open={open}
            onOpenChange={(next) => onOpenChange(next)}
            onValueChange={(value) => {
              if (value === null) return;
              onSelect(value);
              onOpenChange(false);
            }}
          >
            <BaseCombobox.Input autoFocus placeholder={placeholder} className="b4-command-palette__input" />
            <BaseCombobox.Empty className="b4-command-palette__empty">{emptyMessage}</BaseCombobox.Empty>
            <BaseCombobox.List className="b4-command-palette__list">
              {(item: CommandPaletteItem) => (
                <BaseCombobox.Item
                  key={item.value}
                  value={item.value}
                  disabled={item.disabled}
                  className="b4-command-palette__item"
                >
                  <span className="b4-command-palette__item-content">
                    <span className="b4-command-palette__item-label">{item.label}</span>
                    {item.description && (
                      <span className="b4-command-palette__item-description">{item.description}</span>
                    )}
                  </span>
                  {item.shortcut && <KeyboardShortcut keys={item.shortcut} />}
                </BaseCombobox.Item>
              )}
            </BaseCombobox.List>
          </BaseCombobox.Root>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
