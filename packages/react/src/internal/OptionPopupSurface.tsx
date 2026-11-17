import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";

interface OptionPopupSurfaceProps extends HTMLMotionProps<"div"> {
  open: boolean;
  onExitComplete: () => void;
}

/** Internal render target shared by Select and Combobox, not a second popup API. */
export const OptionPopupSurface = forwardRef<HTMLDivElement, OptionPopupSurfaceProps>(
  function OptionPopupSurface({ open, onExitComplete, ...props }, ref) {
    const reducedMotion = useReducedMotion();
    return (
      <motion.div
        {...props}
        ref={ref}
        initial={reducedMotion ? false : { opacity: 0, scale: 0.98 }}
        animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 0.98 }}
        transition={reducedMotion ? { duration: 0 } : springs.settle}
        onAnimationComplete={() => {
          if (!open) onExitComplete();
        }}
      />
    );
  },
);
