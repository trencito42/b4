import type { ReactNode } from "react";
import { Toast as BaseToast } from "@base-ui/react/toast";

export type { ToastObject, ToastManagerAddOptions as ToastAddOptions } from "@base-ui/react/toast";

const SuccessIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <polyline points="3.5 8.5 6.5 11.5 12.5 5" />
  </svg>
);

const ErrorIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="8.5" />
    <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
  </svg>
);

const WarningIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M8 2.5l6 10.5H2L8 2.5z" />
    <line x1="8" y1="6.5" x2="8" y2="9.5" />
    <circle cx="8" cy="11.5" r="0.5" fill="currentColor" />
  </svg>
);

const InfoIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <circle cx="8" cy="8" r="6" />
    <line x1="8" y1="5" x2="8" y2="5" />
    <line x1="8" y1="8" x2="8" y2="11" />
  </svg>
);

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M4 4l8 8M12 4l-8 8" />
  </svg>
);

export interface ToastProviderProps {
  children: ReactNode;
  /** Toasts beyond this count get `data-limited` instead of being removed. @default 3 */
  limit?: number;
  /** Default auto-dismiss time in ms; `0` disables it. Overridable per toast. @default 5000 */
  timeout?: number;
}

export const toastManager = BaseToast.createToastManager();

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

function getToastIcon(type: string | undefined) {
  switch (type) {
    case "success":
      return SuccessIcon;
    case "error":
      return ErrorIcon;
    case "warning":
      return WarningIcon;
    case "info":
      return InfoIcon;
    case "loading":
      return <span className="b4-toast__spinner" aria-hidden="true" />;
    default:
      return null;
  }
}

function ToastList() {
  const { toasts } = BaseToast.useToastManager();
  return (
    <>
      {toasts.map((toast) => {
        const icon = getToastIcon(toast.type);
        return (
          <BaseToast.Root
            key={toast.id}
            toast={toast}
            swipeDirection={["down", "right"]}
            className="b4-toast"
            data-type={toast.type}
          >
            {icon && (
              <div className="b4-toast__icon-wrapper" data-type={toast.type} aria-hidden="true">
                {icon}
              </div>
            )}
            <div className="b4-toast__content">
              {toast.title && <BaseToast.Title className="b4-toast__title" />}
              {toast.description && <BaseToast.Description className="b4-toast__description" />}
              {toast.actionProps && <BaseToast.Action className="b4-toast__action" />}
            </div>
            <BaseToast.Close className="b4-toast__close" aria-label="Dismiss">
              {CloseIcon}
            </BaseToast.Close>
          </BaseToast.Root>
        );
      })}
    </>
  );
}

export const useToast = BaseToast.useToastManager;
