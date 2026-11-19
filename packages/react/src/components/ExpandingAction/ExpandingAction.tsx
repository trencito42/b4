import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";

export interface ExpandingActionProps {
  icon: ReactNode;
  /** Always the button's accessible name, and the text shown once it expands. */
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * A compact 1:1 icon action that expands horizontally to reveal its label
 * on hover or focus — real `layout`-driven FLIP animation, not a tooltip
 * overlapping the button or an instant width jump.
 *
 * When collapsed, it maintains a strict 1:1 aspect ratio matching B4 control
 * dimensions (`--b4-control-height`). When expanded, it fluidly widens into
 * a pill capsule.
 */
export function ExpandingAction({
  icon,
  label,
  onClick,
  disabled = false,
  size = "md",
  className,
}: ExpandingActionProps) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      layout
      disabled={disabled}
      aria-label={label}
      data-expanded={expanded ? "true" : undefined}
      onClick={onClick}
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      transition={reducedMotion ? { duration: 0 } : springs.snap}
      className={[
        "b4-expanding-action",
        `b4-expanding-action--${size}`,
        expanded ? "b4-expanding-action--expanded" : "",
        className ?? "",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      <motion.span layout="position" className="b4-expanding-action__icon" aria-hidden="true">
        {icon}
      </motion.span>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.span
            key="label"
            layout
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={reducedMotion ? { duration: 0 } : { duration: 0.15 }}
            className="b4-expanding-action__label"
            aria-hidden="true"
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
