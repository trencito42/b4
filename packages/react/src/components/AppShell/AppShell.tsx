import { useState, useCallback, useEffect, type ReactNode } from "react";
import { useControllableState } from "../../hooks/useControllableState.js";

export interface AppShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  /** Accessible label for the sidebar landmark — required whenever `sidebar` is passed. */
  sidebarLabel?: string;
  sidebarWidth?: number;
  /** Whether the mobile off-canvas sidebar drawer is open. Controlled. */
  mobileNavOpen?: boolean;
  /** Initial open state for uncontrolled mobile navigation. */
  defaultMobileNavOpen?: boolean;
  /** Callback fired when mobile navigation open state changes. */
  onMobileNavOpenChange?: (open: boolean) => void;
  children: ReactNode;
  className?: string;
}

/**
 * The page-level adaptive layout scaffold — real `<header>`/`<nav>`/`<main>`
 * landmarks with iOS-inspired ergonomics and desktop density.
 *
 * Desktop (>= 769px): static full-height sidebar and independent scroll areas.
 * Mobile (<= 768px): sidebar transforms into an off-canvas drawer with
 * backdrop-blur overlay, safe-area insets, and Escape/click-outside dismissal,
 * preventing mobile content squishing.
 */
export function AppShell({
  header,
  sidebar,
  sidebarLabel = "Sidebar",
  sidebarWidth = 240,
  mobileNavOpen: controlledOpen,
  defaultMobileNavOpen = false,
  onMobileNavOpenChange,
  children,
  className,
}: AppShellProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultMobileNavOpen,
    onChange: onMobileNavOpenChange,
  });

  const closeNav = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeNav();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeNav]);

  return (
    <div className={["b4-app-shell", className ?? ""].filter(Boolean).join(" ")}>
      {header && <header className="b4-app-shell__header">{header}</header>}
      <div className="b4-app-shell__body">
        {sidebar && (
          <>
            {isOpen && (
              <div
                className="b4-app-shell__backdrop"
                aria-hidden="true"
                onClick={closeNav}
              />
            )}
            <nav
              aria-label={sidebarLabel}
              data-open={isOpen ? "true" : "false"}
              className="b4-app-shell__sidebar"
              style={{
                width: sidebarWidth,
                "--sidebar-width": `${sidebarWidth}px`,
              } as React.CSSProperties}
            >
              {sidebar}
            </nav>
          </>
        )}
        <main className="b4-app-shell__content">{children}</main>
      </div>
    </div>
  );
}
