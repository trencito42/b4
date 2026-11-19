import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Popover as BasePopover } from "@base-ui/react/popover";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";

export interface PopoverProps {
  title?: ReactNode;
  children: ReactNode;
  /** The trigger element. Cloned with the props Base UI's `Popover.Trigger` needs. */
  trigger: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
  /** Override the first focused element when the popover opens. */
  initialFocus?: BasePopover.Popup.Props["initialFocus"];
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A real Base UI `Popover` — click-triggered, richer than `Tooltip`
 * (can hold interactive content, has a close-on-outside-click/Escape
 * contract, optional `title`). Use `Tooltip` for a one-line hint shown
 * on hover/focus; use `Popover` for anything with its own interactive
 * content or that should stay open until dismissed.
 */
export function Popover({
  title,
  children,
  trigger,
  side = "bottom",
  initialFocus,
  open: controlledOpen,
  onOpenChange,
}: PopoverProps) {
  const reducedMotion = useReducedMotion();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const openRef = useRef(open);
  const actionsRef = useRef<BasePopover.Root.Actions | null>(null);

  return (
    <BasePopover.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, details) => {
        if (!next && !reducedMotion) details.preventUnmountOnClose();
        openRef.current = next;
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      <BasePopover.Trigger render={trigger} />
      <BasePopover.Portal>
        <BasePopover.Positioner
          side={side}
          sideOffset={() =>
            Number.parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue("--b4-space-3"),
            ) || 0
          }
          className="b4-popover__positioner"
        >
          <BasePopover.Popup
            className="b4-popover__popup"
            initialFocus={initialFocus}
            render={
              <OptionPopupSurface
                open={open}
                onExitComplete={() => {
                  if (!openRef.current) actionsRef.current?.unmount();
                }}
              />
            }
          >
            {title && <BasePopover.Title className="b4-popover__title">{title}</BasePopover.Title>}
            <div className="b4-popover__content">{children}</div>
          </BasePopover.Popup>
        </BasePopover.Positioner>
      </BasePopover.Portal>
    </BasePopover.Root>
  );
}
