import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { useReducedMotion } from "@b4/motion";
import { Spinner, type SpinnerSize } from "../Spinner/Spinner.js";

export interface LoadingOverlayProps {
  visible: boolean;
  /** The spinner's accessible label. @default "Loading" */
  label?: string;
  /** Optional visible text shown under the spinner. */
  message?: ReactNode;
  spinnerSize?: SpinnerSize;
  /** `"absolute"` covers the nearest `position: relative` ancestor; `"fixed"` covers the whole viewport. @default "absolute" */
  variant?: "absolute" | "fixed";
  className?: string;
}

/**
 * A real blocking overlay, not just a visual spinner floating over
 * content that's still clickable underneath — `pointer-events: auto`
 * on the overlay genuinely intercepts clicks on whatever it covers
 * while `visible`. For `variant="absolute"`, the nearest ancestor with
 * `position: relative` (or similar) is what gets covered — the
 * overlay itself doesn't establish one, so the caller's container
 * needs its own positioning context, the same contract as any
 * `position: absolute` overlay.
 */
export function LoadingOverlay({
  visible,
  label = "Loading",
  message,
  spinnerSize = "lg",
  variant = "absolute",
  className,
}: LoadingOverlayProps) {
  const reducedMotion = useReducedMotion();

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          className={[
            "b4-loading-overlay",
            `b4-loading-overlay--${variant}`,
            className ?? "",
          ]
            .filter(Boolean)
            .join(" ")}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
        >
          <div className="b4-loading-overlay__content">
            <Spinner size={spinnerSize} label={label} />
            {message && <p className="b4-loading-overlay__message">{message}</p>}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
