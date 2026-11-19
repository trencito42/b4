import type { ReactNode } from "react";

export interface SidebarItem {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  onClick?: () => void;
}

export interface SidebarSection {
  id: string;
  label?: string;
  items: SidebarItem[];
}

export interface SidebarProps {
  sections: SidebarSection[];
  activeItemId?: string;
  className?: string;
}

/**
 * Persistent app navigation — the content that typically fills
 * `AppShell`'s `sidebar` slot. A real list of links/buttons (not a
 * composite ARIA widget): each item is independently focusable in
 * normal tab order, exactly like ordinary page navigation, because
 * that's what this is. The active item gets a real surface
 * (`--b4-control-bg-selected`), not just a color change — same
 * "selection is a surface, not a checkmark" rule `SegmentedControl`
 * and `DropdownMenu` already follow.
 */
export function Sidebar({ sections, activeItemId, className }: SidebarProps) {
  return (
    <div className={["b4-sidebar", className ?? ""].filter(Boolean).join(" ")}>
      {sections.map((section) => (
        <div key={section.id} className="b4-sidebar__section">
          {section.label && <p className="b4-sidebar__section-label">{section.label}</p>}
          <ul className="b4-sidebar__list">
            {section.items.map((item) => {
              const isActive = item.id === activeItemId;
              const content = (
                <>
                  {item.icon && (
                    <span className="b4-sidebar__icon" aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className="b4-sidebar__label">{item.label}</span>
                </>
              );
              return (
                <li key={item.id}>
                  {item.href ? (
                    <a
                      href={item.href}
                      aria-current={isActive ? "page" : undefined}
                      className={["b4-sidebar__item", isActive ? "b4-sidebar__item--active" : ""].filter(Boolean).join(" ")}
                      onClick={item.onClick}
                    >
                      {content}
                    </a>
                  ) : (
                    <button
                      type="button"
                      aria-current={isActive ? "page" : undefined}
                      className={["b4-sidebar__item", isActive ? "b4-sidebar__item--active" : ""].filter(Boolean).join(" ")}
                      onClick={item.onClick}
                    >
                      {content}
                    </button>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      ))}
    </div>
  );
}
