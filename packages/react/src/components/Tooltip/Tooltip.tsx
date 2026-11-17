import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Tooltip as BaseTooltip } from "@base-ui/react/tooltip";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";

export interface TooltipProps {
  content: ReactNode;
  /** The element the tooltip describes. Cloned with the props Base UI's `Tooltip.Trigger` needs. */
  children: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * A real Base UI `Tooltip` (hover/focus delay, positioning, portal) —
 * `children` becomes the trigger via `Tooltip.Trigger`'s `render` prop,
 * so any existing component (`IconButton`, etc.) works as the described
 * element without duplicating its styling. Wrap a group of triggers in
 * `Tooltip.Provider` yourself (not exported here) if they should share
 * one open delay group; a single `Tooltip` doesn't need it.
 */
export function Tooltip({ content, children, side = "top" }: TooltipProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const openRef = useRef(false);
  const actionsRef = useRef<BaseTooltip.Root.Actions | null>(null);

  return (
    <BaseTooltip.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, details) => {
        if (!next && !reducedMotion) details.preventUnmountOnClose();
        openRef.current = next;
        setOpen(next);
      }}
    >
      <BaseTooltip.Trigger render={children} />
      <BaseTooltip.Portal>
        <BaseTooltip.Positioner
          side={side}
          sideOffset={() =>
            Number.parseFloat(
              getComputedStyle(document.documentElement).getPropertyValue("--b4-space-3"),
            ) || 0
          }
          className="b4-tooltip__positioner"
        >
          <BaseTooltip.Popup
            className="b4-tooltip__popup"
            render={
              <OptionPopupSurface
                open={open}
                onExitComplete={() => {
                  if (!openRef.current) actionsRef.current?.unmount();
                }}
              />
            }
          >
            {content}
          </BaseTooltip.Popup>
        </BaseTooltip.Positioner>
      </BaseTooltip.Portal>
    </BaseTooltip.Root>
  );
}
