import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { Dialog as BaseDialog } from "@base-ui/react/dialog";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";
import { IconButton } from "../IconButton/IconButton.js";

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

export interface DialogProps {
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  /** The trigger element. Omit to drive the dialog fully via `open`/`onOpenChange` instead. */
  trigger?: ReactElement;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * A real Base UI `Dialog` — modal by default (focus trap, backdrop,
 * Escape/outside-click-to-close contract, scroll lock). Use `AlertDialog`
 * instead for destructive confirmations, which doesn't close on outside
 * click (you have to make an explicit choice).
 */
export function Dialog({
  title,
  description,
  children,
  trigger,
  open: controlledOpen,
  defaultOpen,
  onOpenChange,
}: DialogProps) {
  const reducedMotion = useReducedMotion();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen ?? false);
  const open = controlledOpen ?? uncontrolledOpen;
  const openRef = useRef(open);
  const actionsRef = useRef<BaseDialog.Root.Actions | null>(null);

  return (
    <BaseDialog.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, details) => {
        if (!next && !reducedMotion) details.preventUnmountOnClose();
        openRef.current = next;
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      {trigger && <BaseDialog.Trigger render={trigger} />}
      <BaseDialog.Portal>
        <BaseDialog.Backdrop
          className="b4-dialog__backdrop"
          render={
            <OptionPopupSurface
              open={open}
              onExitComplete={() => {}}
            />
          }
        />
        <BaseDialog.Popup
          className="b4-dialog__popup"
          render={
            <OptionPopupSurface
              open={open}
              onExitComplete={() => {
                if (!openRef.current) actionsRef.current?.unmount();
              }}
            />
          }
        >
          <div className="b4-dialog__header">
            <BaseDialog.Title className="b4-dialog__title">{title}</BaseDialog.Title>
            <BaseDialog.Close
              render={<IconButton variant="ghost" size="sm" icon={CloseIcon} aria-label="Close" />}
            />
          </div>
          {description && (
            <BaseDialog.Description className="b4-dialog__description">
              {description}
            </BaseDialog.Description>
          )}
          <div className="b4-dialog__content">{children}</div>
        </BaseDialog.Popup>
      </BaseDialog.Portal>
    </BaseDialog.Root>
  );
}
