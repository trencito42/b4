import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Menu as BaseMenu } from "@base-ui/react/menu";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";

export interface DropdownMenuItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  /** Renders in the danger tone — for irreversible actions like "Delete". */
  destructive?: boolean;
}

export interface DropdownMenuProps {
  items: readonly DropdownMenuItem[];
  onSelect: (value: string) => void;
  /** The trigger element — typically a `Button`/`IconButton`. Cloned with the props Base UI's `Menu.Trigger` needs (ref, aria-*, onClick). */
  trigger: ReactElement;
  className?: string;
}

/**
 * A real Base UI `Menu` (keyboard navigation, typeahead, positioning,
 * focus management), not a styled `<ul>`. `trigger` is rendered through
 * `Menu.Trigger`'s `render` prop so any existing `Button`/`IconButton`
 * becomes the opener without duplicating its styling.
 *
 * `SplitButton`'s secondary chevron button composes this rather than
 * reimplementing menu behavior — see `SplitButton.tsx`.
 */
export function DropdownMenu({ items, onSelect, trigger, className }: DropdownMenuProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const actionsRef = useRef<BaseMenu.Root.Actions | null>(null);

  return (
    <BaseMenu.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, details) => {
        if (!next && !reducedMotion) details.preventUnmountOnClose();
        openRef.current = next;
        setOpen(next);
      }}
    >
      <BaseMenu.Trigger render={trigger} />
      <BaseMenu.Portal>
        <BaseMenu.Positioner
          side="bottom"
          align="end"
          sideOffset={() =>
            Number.parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue("--b4-space-2"),
            ) || 0
          }
          className="b4-dropdown-menu__positioner"
        >
          <BaseMenu.Popup
            className={["b4-dropdown-menu__popup", className ?? ""].filter(Boolean).join(" ")}
            render={
              <OptionPopupSurface
                open={open}
                onExitComplete={() => {
                  if (!openRef.current) actionsRef.current?.unmount();
                }}
              />
            }
          >
            {items.map((item) => (
              <BaseMenu.Item
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
              </BaseMenu.Item>
            ))}
          </BaseMenu.Popup>
        </BaseMenu.Positioner>
      </BaseMenu.Portal>
    </BaseMenu.Root>
  );
}
