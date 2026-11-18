import type { ReactNode } from "react";
import { Accordion as BaseAccordion } from "@base-ui/react/accordion";

export interface AccordionItemSpec {
  value: string;
  title: ReactNode;
  content: ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items: readonly AccordionItemSpec[];
  /** Allows more than one item open at once. Defaults to false (one open at a time). */
  multiple?: boolean;
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: string | string[]) => void;
  className?: string;
}

const ChevronIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/**
 * Built on Base UI's `Accordion` — real ARIA (region/heading/button
 * semantics), keyboard interaction, and panel height animated from its
 * own measured `--accordion-panel-height` CSS variable (Base UI computes
 * this; the CSS here just transitions `height` to it). The chevron
 * rotates via the Trigger's own `[data-panel-open]` — confirmed from
 * `AccordionTriggerDataAttributes` (note: the Item and Panel parts use
 * `data-open` instead; each Base UI accordion part has its own exact
 * attribute name, not a single shared one — see `HANDOFF.md`'s note
 * after the `Tabs` `data-active` mistake for why this is checked per
 * part rather than assumed).
 */
function toArray(v: string | string[] | undefined): string[] | undefined {
  if (v === undefined) return undefined;
  return Array.isArray(v) ? v : [v];
}

export function Accordion({ items, multiple = false, value, defaultValue, onValueChange, className }: AccordionProps) {
  return (
    <BaseAccordion.Root
      multiple={multiple}
      value={toArray(value)}
      defaultValue={toArray(defaultValue)}
      onValueChange={(next) => {
        const values = next as string[];
        onValueChange?.(multiple ? values : values[0] ?? "");
      }}
      className={["b4-accordion", className ?? ""].filter(Boolean).join(" ")}
    >
      {items.map((item) => (
        <BaseAccordion.Item
          key={item.value}
          value={item.value}
          disabled={item.disabled}
          className="b4-accordion__item"
        >
          <BaseAccordion.Header className="b4-accordion__header">
            <BaseAccordion.Trigger className="b4-accordion__trigger">
              <span className="b4-accordion__chevron">{ChevronIcon}</span>
              <span className="b4-accordion__title">{item.title}</span>
            </BaseAccordion.Trigger>
          </BaseAccordion.Header>
          <BaseAccordion.Panel className="b4-accordion__panel">
            <div className="b4-accordion__content">{item.content}</div>
          </BaseAccordion.Panel>
        </BaseAccordion.Item>
      ))}
    </BaseAccordion.Root>
  );
}
