import { useState, type ReactElement, type ReactNode } from "react";
import { Drawer as BaseDrawer } from "@base-ui/react/drawer";
import { IconButton } from "../IconButton/IconButton.js";

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

export interface DrawerProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** The trigger element. Omit to drive the drawer fully via `open`/`onOpenChange` instead. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A real Base UI `Drawer` — a side panel sliding in from the right edge,
 * modal by default (focus trap, backdrop, Escape/outside-click-to-close),
 * with genuine swipe-to-dismiss built into the primitive (drag the panel
 * toward the right edge to close it) rather than a static mockup of one.
 * CSS-driven transitions (`data-starting-style`/`data-ending-style` +
 * the primitive's own `--drawer-swipe-movement-x` var during a drag), not
 * Motion — a Motion `scale`/`x` transform here would collide with the
 * swipe-driven `transform` the primitive itself writes during a drag, the
 * same transform-collision class documented for Dialog/Slider.
 */
export function Drawer({
  title,
  description,
  children,
  trigger,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
}: DrawerProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const open = controlledOpen ?? uncontrolledOpen;

  return (
    <BaseDrawer.Root
      open={open}
      swipeDirection="right"
      onOpenChange={(next) => {
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      {trigger && <BaseDrawer.Trigger render={trigger} />}
      <BaseDrawer.Portal>
        <BaseDrawer.Backdrop className="b4-drawer__backdrop" />
        <BaseDrawer.Viewport className="b4-drawer__viewport">
          <BaseDrawer.Popup className="b4-drawer__popup">
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
