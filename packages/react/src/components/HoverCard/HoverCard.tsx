import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { PreviewCard } from "@base-ui/react/preview-card";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";

export interface HoverCardProps {
  children: ReactNode;
  /** The trigger element. Cloned with the props Base UI's `PreviewCard.Trigger` needs. */
  trigger: ReactElement;
  side?: "top" | "bottom" | "left" | "right";
}

/**
 * A richer, longer-hover-delay preview than `Tooltip` — built on Base
 * UI's `PreviewCard` (named "preview-card" in `@base-ui/react`; this
 * component uses the mission brief's "HoverCard" name since that's the
 * conventional one). Use for a user/link/card preview on hover; use
 * `Tooltip` for a one-line hint, `Popover` for click-triggered content.
 */
export function HoverCard({ children, trigger, side = "bottom" }: HoverCardProps) {
  const reducedMotion = useReducedMotion();
  const [open, setOpen] = useState(false);
  const openRef = useRef(open);
  const actionsRef = useRef<PreviewCard.Root.Actions | null>(null);

  return (
    <PreviewCard.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, details) => {
        if (!next && !reducedMotion) details.preventUnmountOnClose();
        openRef.current = next;
        setOpen(next);
      }}
    >
      <PreviewCard.Trigger render={trigger} />
      <PreviewCard.Portal>
        <PreviewCard.Positioner side={side} className="b4-hover-card__positioner">
          <PreviewCard.Popup
            className="b4-hover-card__popup"
            render={
              <OptionPopupSurface
                open={open}
                onExitComplete={() => {
                  if (!openRef.current) actionsRef.current?.unmount();
                }}
              />
            }
          >
            {children}
          </PreviewCard.Popup>
        </PreviewCard.Positioner>
      </PreviewCard.Portal>
    </PreviewCard.Root>
  );
}
