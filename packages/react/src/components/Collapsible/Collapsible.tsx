import type { ReactNode } from "react";
import { Collapsible as BaseCollapsible } from "@base-ui/react/collapsible";

export interface CollapsibleProps {
  /** The always-visible trigger content (e.g. a label + chevron). */
  trigger: ReactNode;
  children: ReactNode;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  disabled?: boolean;
  className?: string;
}

const ChevronIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * A single show/hide panel — the primitive `Accordion` is built from.
 * Use `Collapsible` for one independent expand/collapse (a "show more"
 * section, an inspector's details panel); use `Accordion` for several
 * related panels sharing open/close coordination. Built on Base UI's
 * `Collapsible`, panel height animated from its own measured
 * `--collapsible-panel-height` CSS variable.
 */
export function Collapsible({ trigger, children, open, defaultOpen, onOpenChange, disabled, className }: CollapsibleProps) {
  return (
    <BaseCollapsible.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
      disabled={disabled}
      className={["b4-collapsible", className ?? ""].filter(Boolean).join(" ")}
    >
      <BaseCollapsible.Trigger className="b4-collapsible__trigger">
        <span className="b4-collapsible__chevron">{ChevronIcon}</span>
        <span className="b4-collapsible__trigger-content">{trigger}</span>
      </BaseCollapsible.Trigger>
      <BaseCollapsible.Panel className="b4-collapsible__panel">
        <div className="b4-collapsible__content">{children}</div>
      </BaseCollapsible.Panel>
    </BaseCollapsible.Root>
  );
}
