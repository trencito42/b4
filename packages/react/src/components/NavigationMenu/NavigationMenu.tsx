import type { ReactNode } from "react";
import { NavigationMenu as BaseNavigationMenu } from "@base-ui/react/navigation-menu";

export interface NavigationMenuLinkItem {
  label: string;
  href: string;
  description?: string;
  /** Optional icon rendered to the left of the link item. */
  icon?: ReactNode;
  /** Optional badge rendered next to the link label. */
  badge?: ReactNode;
}

export interface NavigationMenuSection {
  label: string;
  items: readonly NavigationMenuLinkItem[];
  /** Optional column layout for this section's items (1 or 2). Defaults to 1. */
  columns?: 1 | 2;
  /** Optional footer link at the bottom of the section popup. */
  footer?: {
    label: string;
    href: string;
  };
}

export interface NavigationMenuProps {
  sections: readonly NavigationMenuSection[];
  /** Required — the top-level nav has no visible label of its own. */
  "aria-label": string;
  className?: string;
}

/**
 * Site-chrome navigation: a row of tactile capsule triggers revealing rich popup
 * link surfaces, sharing one animated viewport that resizes and slides smoothly
 * between sections. Built on Base UI's NavigationMenu primitive with B4's
 * Graphite/Porcelain visual identity and iOS-inspired interaction ergonomics.
 */
export function NavigationMenu({ sections, className, ...rest }: NavigationMenuProps) {
  return (
    <BaseNavigationMenu.Root className={["b4-navigation-menu", className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <BaseNavigationMenu.List className="b4-navigation-menu__list">
        {sections.map((section) => (
          <BaseNavigationMenu.Item key={section.label} className="b4-navigation-menu__item">
            <BaseNavigationMenu.Trigger className="b4-navigation-menu__trigger">
              <span className="b4-navigation-menu__trigger-text">{section.label}</span>
              <ChevronIcon />
            </BaseNavigationMenu.Trigger>
            <BaseNavigationMenu.Content className="b4-navigation-menu__content">
              <ul
                className={[
                  "b4-navigation-menu__link-list",
                  section.columns === 2 ? "b4-navigation-menu__link-list--cols-2" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
              >
                {section.items.map((item) => (
                  <li key={item.href} className="b4-navigation-menu__link-item">
                    <BaseNavigationMenu.Link href={item.href} className="b4-navigation-menu__link">
                      {item.icon && <span className="b4-navigation-menu__link-icon">{item.icon}</span>}
                      <div className="b4-navigation-menu__link-body">
                        <div className="b4-navigation-menu__link-header">
                          <span className="b4-navigation-menu__link-label">{item.label}</span>
                          {item.badge && (
                            typeof item.badge === "string" ? (
                              <span className="b4-navigation-menu__link-badge">{item.badge}</span>
                            ) : (
                              item.badge
                            )
                          )}
                        </div>
                        {item.description && (
                          <span className="b4-navigation-menu__link-description">{item.description}</span>
                        )}
                      </div>
                    </BaseNavigationMenu.Link>
                  </li>
                ))}
              </ul>
              {section.footer && (
                <div className="b4-navigation-menu__footer">
                  <a href={section.footer.href} className="b4-navigation-menu__footer-link">
                    <span>{section.footer.label}</span>
                    <ArrowRightIcon />
                  </a>
                </div>
              )}
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
      strokeWidth={1.75}
      aria-hidden="true"
    >
      <path d="m4 6 4 4 4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRightIcon() {
  return (
    <svg
      className="b4-navigation-menu__footer-icon"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.5}
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
