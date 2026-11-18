import { useState, type ReactNode } from "react";
import { ContextMenu as BaseContextMenu } from "@base-ui/react/context-menu";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";
import type { DropdownMenuItem } from "../DropdownMenu/DropdownMenu.js";

export interface ContextMenuProps {
  items: readonly DropdownMenuItem[];
  onSelect: (value: string) => void;
  /** The area that opens the menu on right-click or long-press. */
  children: ReactNode;
  className?: string;
}

/**
 * Right-click (or long-press) context menu — a real Base UI
 * `ContextMenu`, reusing `DropdownMenuItem`'s shape and the same
 * `b4-dropdown-menu__*` classes (it's the same visual menu, just opened
 * differently), rather than a parallel implementation. Unlike
 * `DropdownMenu`, `children` isn't cloned via a `render` prop — Base
 * UI's `ContextMenu.Trigger` renders its own wrapping `<div>` around an
 * arbitrary area.
 */
export function ContextMenu({ items, onSelect, children, className }: ContextMenuProps) {
  const [open, setOpen] = useState(false);

  return (
    <BaseContextMenu.Root open={open} onOpenChange={(next) => setOpen(next)}>
      <BaseContextMenu.Trigger className={className}>{children}</BaseContextMenu.Trigger>
      <BaseContextMenu.Portal>
        <BaseContextMenu.Positioner className="b4-dropdown-menu__positioner">
          <BaseContextMenu.Popup
            className="b4-dropdown-menu__popup"
            // Unlike Menu/Select/Dialog, ContextMenu.Root has no
            // actionsRef/preventUnmountOnClose — it manages its own
            // unmount timing. OptionPopupSurface's onExitComplete is a
            // no-op here for that reason, not an oversight.
            render={<OptionPopupSurface open={open} onExitComplete={() => {}} />}
          >
            {items.map((item) => (
              <BaseContextMenu.Item
                key={item.value}
                disabled={item.disabled}
                onClick={() => onSelect(item.value)}
                className={[
                  "b4-dropdown-menu__item",
                  item.destructive ? "b4-dropdown-menu__item--destructive" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {item.label}
              </BaseContextMenu.Item>
            ))}
          </BaseContextMenu.Popup>
        </BaseContextMenu.Positioner>
      </BaseContextMenu.Portal>
    </BaseContextMenu.Root>
  );
}
