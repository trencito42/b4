import { forwardRef, useState, type ReactNode } from "react";
import { motion, type HTMLMotionProps } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";

interface FieldControlProps extends Omit<HTMLMotionProps<"div">, "children"> {
  children?: ReactNode;
  disabled?: boolean;
}

/** Shared focus surface for editable fields. It never replaces the native input. */
export const FieldControl = forwardRef<HTMLDivElement, FieldControlProps>(
  function FieldControl(
    { disabled = false, children, className, onFocusCapture, onBlurCapture, ...props },
    ref,
  ) {
    const [focused, setFocused] = useState(false);
    const reducedMotion = useReducedMotion();
    const active = focused && !disabled;
    return (
      <motion.div
        {...props}
        ref={ref}
        className={["b4-field-control", className ?? ""].filter(Boolean).join(" ")}
        data-focus-within={active || undefined}
        onFocusCapture={(event) => {
          setFocused(true);
          onFocusCapture?.(event);
        }}
        onBlurCapture={(event) => {
          if (!event.currentTarget.contains(event.relatedTarget as Node | null))
            setFocused(false);
          onBlurCapture?.(event);
        }}
      >
        <motion.span
          className="b4-field-control__halo"
          aria-hidden="true"
          initial={false}
          animate={{
            opacity: active ? 1 : 0,
            scale: active || reducedMotion ? 1 : 0.985,
          }}
          transition={reducedMotion ? { duration: 0 } : springs.snap}
        />
        {children}
      </motion.div>
    );
  },
);
