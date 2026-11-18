import { useState, type ReactElement, type ReactNode } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { IconButton } from "../IconButton/IconButton.js";

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

export interface SheetProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** The trigger element. Omit to drive the sheet fully via `open`/`onOpenChange` instead. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * `Sheet` is `Drawer`'s bottom-anchored sibling — same Base UI `drawer`
 * primitive, `swipeDirection="down"` instead of `"right"`, and reuses
 * `Drawer`'s backdrop/header/title/description/content CSS classes
 * (`.b4-drawer__*`) rather than duplicating them, the same way
 * `AlertDialog` reuses `Dialog`'s CSS. Only the popup's positioning and
 * swipe-axis rules are Sheet's own (`.b4-sheet__popup`). A real mobile
 * bottom sheet, not a repositioned side panel: drag it toward the bottom
 * edge to dismiss.
 */
export function Sheet({ title, description, children, trigger, open: controlledOpen, defaultOpen, onOpenChange }: SheetProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const open = controlledOpen ?? uncontrolledOpen;

  return (
    <BaseDrawer.Root
      open={open}
      swipeDirection="down"
      onOpenChange={(next) => {
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      {trigger && <BaseDrawer.Trigger render={trigger} />}
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="b4-drawer__backdrop" />
        <BaseDrawer.Viewport className="b4-drawer__viewport">
          <BaseDrawer.Popup className="b4-sheet__popup">
            <div className="b4-sheet__grabber" aria-hidden="true" />
            <div className="b4-drawer__header">
              <BaseDrawer.Title className="b4-drawer__title">{title}</BaseDrawer.Title>
              <BaseDrawer.Close render={<IconButton variant="ghost" size="sm" icon={CloseIcon} aria-label="Close" />} />
            </div>
            {description && (
              <BaseDrawer.Description className="b4-drawer__description">{description}</BaseDrawer.Description>
            )}
            <div className="b4-drawer__content">{children}</div>
          </BaseDrawer.Popup>
        </BaseDrawer.Viewport>
      </BaseDrawer.Portal>
    </BaseDrawer.Root>
  );
}
