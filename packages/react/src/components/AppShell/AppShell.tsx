import type { ReactNode } from "react";

export interface AppShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  /** Accessible label for the sidebar landmark — required whenever `sidebar` is passed, since a real `<nav>` needs one when there's more than one on the page. */
  sidebarLabel?: string;
  sidebarWidth?: number;
  children: ReactNode;
  className?: string;
}

/**
 * The page-level layout scaffold other Family F components (and real
 * pages) compose inside — real `<header>`/`<nav>`/`<main>` landmarks,
 * not `<div>`s styled to look like regions. `header` is fixed-height
 * and spans the full width; `sidebar` and the main content area fill
 * the remaining viewport height independently, each scrolling on its
 * own rather than the whole page scrolling as one block.
 */
export function AppShell({ header, sidebar, sidebarLabel = "Sidebar", sidebarWidth = 240, children, className }: AppShellProps) {
  return (
    <div className={["b4-app-shell", className ?? ""].filter(Boolean).join(" ")}>
      {header && <header className="b4-app-shell__header">{header}</header>}
      <div className="b4-app-shell__body">
        {sidebar && (
          <nav aria-label={sidebarLabel} className="b4-app-shell__sidebar" style={{ width: sidebarWidth }}>
            {sidebar}
          </nav>
        )}
        <main className="b4-app-shell__content">{children}</main>
      </div>
    </div>
  );
}
