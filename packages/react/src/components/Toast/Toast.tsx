import type { ReactNode } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";

export type { ToastObject, ToastManagerAddOptions as ToastAddOptions } from "@base-ui/react/toast";

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

export interface ToastProviderProps {
  children: ReactNode;
  /** Toasts beyond this count get `data-limited` instead of being removed. @default 3 */
  limit?: number;
  /** Default auto-dismiss time in ms; `0` disables it. Overridable per toast. @default 5000 */
  timeout?: number;
}

/** A single global manager, shared by every `ToastProvider` instance — lets `useToast()` (or anything holding a reference to this module) add a toast from outside React, the documented reason `Toast.createToastManager()` exists as a module-level call rather than something created per-component. */
export const toastManager = BaseToast.createToastManager();

/**
 * Wrap the app (or the relevant subtree) once. Real Base UI `Toast` —
 * a stacked, swipe-to-dismiss viewport (drag toward its dismiss edge
 * to close, genuinely, not a fade-out timer with no interaction), with
 * `low`/`high` announcement priority and a real `promise()` helper for
 * loading → success/error toasts tied to an actual async operation.
 * Call `useToast()` anywhere inside this provider to add/close/update
 * toasts.
 */
export function ToastProvider({ children, limit = 3, timeout = 5000 }: ToastProviderProps) {
  return (
    <BaseToast.Provider toastManager={toastManager} limit={limit} timeout={timeout}>
      {children}
      <BaseToast.Portal>
        <BaseToast.Viewport className="b4-toast__viewport">
          <ToastList />
        </BaseToast.Viewport>
      </BaseToast.Portal>
    </BaseToast.Provider>
  );
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return (
    <>
      {toasts.map((toast) => (
        <BaseToast.Root key={toast.id} toast={toast} swipeDirection={["down", "right"]} className="b4-toast" data-type={toast.type}>
          <div className="b4-toast__content">
            {toast.title && <BaseToast.Title className="b4-toast__title" />}
            {toast.description && <BaseToast.Description className="b4-toast__description" />}
            {toast.actionProps && <BaseToast.Action className="b4-toast__action" />}
          </div>
          <BaseToast.Close className="b4-toast__close" aria-label="Dismiss">
            {CloseIcon}
          </BaseToast.Close>
        </BaseToast.Root>
      ))}
    </>
  );
}

/** Add/close/update toasts, or run `promise()` for a loading → success/error sequence tied to a real async operation. Must be called inside `ToastProvider`. */
export const useToast = BaseToast.useToastManager;
