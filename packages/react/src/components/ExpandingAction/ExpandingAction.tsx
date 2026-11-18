import { useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";
import { springs, useReducedMotion } from "@b4/motion";

export interface ExpandingActionProps {
  icon: ReactNode;
  /** Always the button's accessible name, and the text shown once it expands. */
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}

/**
 * A compact icon action that expands to reveal its label on hover or
 * focus — real `layout`-driven width animation (the same FLIP
 * technique `MorphingSurface` wraps), not a tooltip overlapping the
 * button or a CSS `:hover { width: ... }` snap. The label stays in the
 * accessible name via `aria-label` at every width, so it's never
 * announced twice and never missing when collapsed.
 */
export function ExpandingAction({ icon, label, onClick, disabled = false, className }: ExpandingActionProps) {
  const [expanded, setExpanded] = useState(false);
  const reducedMotion = useReducedMotion();

  return (
    <motion.button
      type="button"
      layout
      disabled={disabled}
      aria-label={label}
      onClick={onClick}
      onPointerEnter={() => setExpanded(true)}
      onPointerLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={() => setExpanded(false)}
      transition={reducedMotion ? { duration: 0 } : springs.snap}
      className={["b4-expanding-action", className ?? ""].filter(Boolean).join(" ")}
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
