import type { ReactNode } from "react";
import { Tabs as BaseTabs } from "@base-ui/react/tabs";
import { useControllableState } from "../../hooks/useControllableState.js";
import { useSwipeNavigation } from "../../hooks/useSwipeNavigation.js";

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
  /**
   * When true, swiping horizontally on the tab panel area navigates
   * between enabled tab panels. Respects vertical page scrolling. Defaults to false.
   */
  swipeable?: boolean;
  /** Required — the tab list has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * Built on Base UI's `Tabs` — real roving-tabindex arrow-key navigation,
 * ARIA tablist/tab/tabpanel semantics, and automatic content switching.
 *
 * Supports optional horizontal swipeable navigation between panels:
 * swiping across panels smoothly navigates to adjacent tabs, skips disabled
 * tabs, and distinguishes swipe intent from vertical page scrolling.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  swipeable = false,
  className,
  ...rest
}: TabsProps) {
  const [activeValue, setActiveValue] = useControllableState<string>({
    value,
    defaultValue: defaultValue ?? items[0]?.value ?? "",
    onChange: onValueChange,
  });

  const { dragOffset, isSwiping, containerProps } = useSwipeNavigation({
    items,
    value: activeValue,
    onNavigate: (next) => setActiveValue(next),
    enabled: swipeable,
  });

  const { style: swipeStyle, ...swipeHandlers } = containerProps;

  return (
    <BaseTabs.Root
      value={activeValue}
      onValueChange={(next) => setActiveValue(next as string)}
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
      <div
        className="b4-tabs__panels-viewport"
        style={swipeable ? swipeStyle : undefined}
        {...(swipeable ? swipeHandlers : {})}
      >
        {items.map((item) => {
          const isActive = item.value === activeValue;
          return (
            <BaseTabs.Panel
              key={item.value}
              value={item.value}
              className={[
                "b4-tabs__panel",
                isSwiping && isActive ? "b4-tabs__panel--swiping" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              style={
                isSwiping && isActive
                  ? {
                      transform: `translateX(${dragOffset}px)`,
                      transition: "none",
                    }
                  : undefined
              }
            >
              {item.content}
            </BaseTabs.Panel>
          );
        })}
      </div>
    </BaseTabs.Root>
  );
}
