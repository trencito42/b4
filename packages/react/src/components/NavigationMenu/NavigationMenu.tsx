import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";

export interface NavigationMenuLinkItem {
  label: string;
  href: string;
  description?: string;
}

export interface NavigationMenuSection {
  label: string;
  items: readonly NavigationMenuLinkItem[];
}

export interface NavigationMenuProps {
  sections: readonly NavigationMenuSection[];
  /** Required — the top-level nav has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * Site-chrome navigation: a row of triggers, each revealing a popup list
 * of links, sharing one animated viewport that resizes/slides between
 * sections. Built on Base UI's own `NavigationMenu` primitive (it covers
 * this directly — no need to build it from scratch on top of `Menu`).
 * The open/close and section-to-section transitions are Base UI's own
 * CSS-driven ones (`data-starting-style`/`data-ending-style`), timed off
 * the shared duration tokens so `data-b4-motion="reduced"` zeroes them
 * the same way every other CSS-transition-based component here does.
 */
export function NavigationMenu({ sections, className, ...rest }: NavigationMenuProps) {
  return (
    <BaseNavigationMenu.Root className={["b4-navigation-menu", className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <BaseNavigationMenu.List className="b4-navigation-menu__list">
        {sections.map((section) => (
          <BaseNavigationMenu.Item key={section.label} className="b4-navigation-menu__item">
            <BaseNavigationMenu.Trigger className="b4-navigation-menu__trigger">
              {section.label}
              <ChevronIcon />
            </BaseNavigationMenu.Trigger>
            <BaseNavigationMenu.Content className="b4-navigation-menu__content">
              <ul className="b4-navigation-menu__link-list">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <BaseNavigationMenu.Link href={item.href} className="b4-navigation-menu__link">
                      <span className="b4-navigation-menu__link-label">{item.label}</span>
                      {item.description && (
                        <span className="b4-navigation-menu__link-description">{item.description}</span>
                      )}
                    </BaseNavigationMenu.Link>
                  </li>
                ))}
              </ul>
            </BaseNavigationMenu.Content>
          </BaseNavigationMenu.Item>
        ))}
      </BaseNavigationMenu.List>
      <BaseNavigationMenu.Portal>
        <BaseNavigationMenu.Positioner className="b4-navigation-menu__positioner" sideOffset={8}>
          <BaseNavigationMenu.Popup className="b4-navigation-menu__popup">
            <BaseNavigationMenu.Viewport className="b4-navigation-menu__viewport" />
          </BaseNavigationMenu.Popup>
        </BaseNavigationMenu.Positioner>
      </BaseNavigationMenu.Portal>
    </BaseNavigationMenu.Root>
  );
}

function ChevronIcon() {
  return (
    <svg
      className="b4-navigation-menu__trigger-icon"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
