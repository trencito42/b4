import { useRef, useState, type ReactElement, type ReactNode } from "react";
import { AlertDialog as BaseAlertDialog } from "@base-ui/react/alert-dialog";
import { useReducedMotion } from "@b4/motion";
import { OptionPopupSurface } from "../../internal/OptionPopupSurface.js";
import { Button } from "../Button/Button.js";

export interface AlertDialogProps {
  title: ReactNode;
  description?: ReactNode;
  /** The trigger element. Omit to drive the dialog fully via `open`/`onOpenChange`. */
  trigger?: ReactElement;
  /** Label for the dismissive action. Defaults to "Cancel". */
  cancelLabel?: string;
  /** Label for the confirming action. */
  confirmLabel: string;
  onConfirm: () => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

/**
 * For destructive/irreversible confirmations — unlike `Dialog`, it does
 * **not** close on outside click (Base UI's `AlertDialog.Root` omits
 * that affordance entirely, not something this component disables), so
 * the user must make an explicit Cancel/Confirm choice. No decorative
 * close (×) button, for the same reason. Pair with `Button
 * variant="destructive"` for the confirming action — see
 * `DESIGN_PRINCIPLES.md`'s rule that destructive actions feel serious,
 * not showy.
 */
export function AlertDialog({
  title,
  description,
  trigger,
  cancelLabel = "Cancel",
  confirmLabel,
  onConfirm,
  open: controlledOpen,
  onOpenChange,
}: AlertDialogProps) {
  const reducedMotion = useReducedMotion();
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);
  const open = controlledOpen ?? uncontrolledOpen;
  const openRef = useRef(open);
  const actionsRef = useRef<BaseAlertDialog.Root.Actions | null>(null);

  function close() {
    setUncontrolledOpen(false);
    onOpenChange?.(false);
  }

  return (
    <BaseAlertDialog.Root
      open={open}
      actionsRef={actionsRef}
      onOpenChange={(next, details) => {
        if (!next && !reducedMotion) details.preventUnmountOnClose();
        openRef.current = next;
        setUncontrolledOpen(next);
        onOpenChange?.(next);
      }}
    >
      {trigger && <BaseAlertDialog.Trigger render={trigger} />}
      <BaseAlertDialog.Portal>
        <BaseAlertDialog.Backdrop
          className="b4-dialog__backdrop"
          render={<OptionPopupSurface open={open} onExitComplete={() => {}} />}
        />
        <BaseAlertDialog.Popup
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
          <BaseAlertDialog.Title className="b4-dialog__title">{title}</BaseAlertDialog.Title>
          {description && (
            <BaseAlertDialog.Description className="b4-dialog__description">
              {description}
            </BaseAlertDialog.Description>
          )}
          <div className="b4-alert-dialog__actions">
            <Button variant="secondary" onClick={close}>
              {cancelLabel}
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                onConfirm();
                close();
              }}
            >
              {confirmLabel}
            </Button>
          </div>
        </BaseAlertDialog.Popup>
      </BaseAlertDialog.Portal>
    </BaseAlertDialog.Root>
  );
}
