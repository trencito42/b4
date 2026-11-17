import type { ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";

export interface TabsItem {
  value: string;
  label: ReactNode;
  disabled?: boolean;
  content: ReactNode;
}

export interface TabsProps {
  items: readonly TabsItem[];
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  /** Required — the tab list has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * Built on Base UI's `Tabs` — real roving-tabindex arrow-key navigation,
 * ARIA tablist/tab/tabpanel semantics, and automatic content switching.
 * The traveling indicator is Base UI's own `Tabs.Indicator`, which
 * exposes its computed position as CSS custom properties
 * (`--active-tab-left`/`-width` etc.) — styled here with a plain CSS
 * `transition` rather than Motion, since Base UI (not this component)
 * owns the position calculation; the CSS token-driven `transition`
 * already respects the reduced-motion duration zeroing in `base.css`.
 */
export function Tabs({ items, value, defaultValue, onValueChange, className, ...rest }: TabsProps) {
  return (
    <BaseTabs.Root
      value={value}
      defaultValue={defaultValue ?? items[0]?.value}
      onValueChange={(next) => onValueChange?.(next as string)}
      className={["b4-tabs", className ?? ""].filter(Boolean).join(" ")}
      {...rest}
    >
      <BaseTabs.List className="b4-tabs__list">
        {items.map((item) => (
          <BaseTabs.Tab
            key={item.value}
            value={item.value}
            disabled={item.disabled}
            className="b4-tabs__tab"
          >
            {item.label}
          </BaseTabs.Tab>
        ))}
        <BaseTabs.Indicator className="b4-tabs__indicator" />
      </BaseTabs.List>
      {items.map((item) => (
        <BaseTabs.Panel key={item.value} value={item.value} className="b4-tabs__panel">
          {item.content}
        </BaseTabs.Panel>
      ))}
    </BaseTabs.Root>
  );
}
