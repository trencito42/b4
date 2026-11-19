import {
  useState,
  useCallback,
  useEffect,
  useRef,
  useId,
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useControllableState } from "../../hooks/useControllableState.js";

const focusableSelector = "button, [href], input, select, textarea, [tabindex]";

export interface AppShellContextValue {
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  toggleMobileNav: () => void;
  sidebarId: string;
}

const AppShellContext = createContext<AppShellContextValue | null>(null);

export function useAppShell(): AppShellContextValue {
  const ctx = useContext(AppShellContext);
  if (!ctx) {
    throw new Error("useAppShell must be used within an <AppShell> component tree.");
  }
  return ctx;
}

export interface AppShellMobileTriggerProps {
  className?: string;
  children?: ReactNode;
  "aria-label"?: string;
}

export function AppShellMobileTrigger({
  className,
  children,
  "aria-label": ariaLabel = "Toggle navigation menu",
}: AppShellMobileTriggerProps) {
  const { mobileNavOpen, toggleMobileNav, sidebarId } = useAppShell();
  return (
    <button
      type="button"
      className={["b4-app-shell__mobile-trigger", className ?? ""]
        .filter(Boolean)
        .join(" ")}
      aria-label={ariaLabel}
      aria-expanded={mobileNavOpen}
      aria-controls={sidebarId}
      onClick={toggleMobileNav}
    >
      {children ?? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="b4-app-shell__mobile-trigger-icon"
        >
          {mobileNavOpen ? (
            <>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </>
          ) : (
            <>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
            </>
          )}
        </svg>
      )}
    </button>
  );
}

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
  /** Whether to automatically close the mobile nav drawer when a link or item is clicked. Defaults to true. */
  closeOnNavigate?: boolean;
  children: ReactNode;
  className?: string;
}

/**
 * The page-level adaptive layout scaffold — real `<header>`/`<nav>`/`<main>`
 * landmarks with iOS-inspired ergonomics and desktop density.
 *
 * Desktop (>= 769px): static full-height sidebar and independent scroll areas.
 * Mobile (<= 768px): sidebar transforms into an off-canvas drawer with
 * backdrop-blur overlay, safe-area insets, focus isolation (inert when hidden),
 * focus restoration, and Escape/click-outside dismissal.
 */
export function AppShell({
  header,
  sidebar,
  sidebarLabel = "Sidebar",
  sidebarWidth = 240,
  mobileNavOpen: controlledOpen,
  defaultMobileNavOpen = false,
  onMobileNavOpenChange,
  closeOnNavigate = true,
  children,
  className,
}: AppShellProps) {
  const [isOpen, setIsOpen] = useControllableState({
    value: controlledOpen,
    defaultValue: defaultMobileNavOpen,
    onChange: onMobileNavOpenChange,
  });

  const sidebarId = useId();
  const navRef = useRef<HTMLElement | null>(null);
  const lastFocusedRef = useRef<HTMLElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const hasSidebar = Boolean(sidebar);
  const mobileDrawerOpen = hasSidebar && isMobile && isOpen;

  // Detect mobile viewport for inert focus isolation
  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(max-width: 768px)");
    setIsMobile(mql.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, []);

  const closeNav = useCallback(() => {
    setIsOpen(false);
  }, [setIsOpen]);

  const toggleMobileNav = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, [setIsOpen]);

  // Focus management & Escape key handling
  useEffect(() => {
    if (!isMobile || !hasSidebar) return;

    if (isOpen) {
      lastFocusedRef.current = document.activeElement as HTMLElement | null;
      const getTabs = () =>
        Array.from(
          navRef.current?.querySelectorAll<HTMLElement>(focusableSelector) ?? [],
        ).filter(
          (element) =>
            element.tabIndex >= 0 &&
            !element.matches(":disabled") &&
            element.getClientRects().length > 0,
        );
      const frame = requestAnimationFrame(() =>
        (getTabs()[0] ?? navRef.current)?.focus(),
      );

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.defaultPrevented) return;
        if (e.key === "Escape") {
          e.preventDefault();
          closeNav();
        }
        if (e.key === "Tab") {
          const tabs = getTabs();
          const first = tabs[0];
          const last = tabs.at(-1);
          const active = document.activeElement;
          if (
            !tabs.includes(active as HTMLElement) ||
            active === (e.shiftKey ? first : last)
          ) {
            e.preventDefault();
            (e.shiftKey ? last : first)?.focus();
          }
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => {
        cancelAnimationFrame(frame);
        window.removeEventListener("keydown", handleKeyDown);
      };
    } else {
      if (lastFocusedRef.current && document.contains(lastFocusedRef.current)) {
        lastFocusedRef.current.focus();
        lastFocusedRef.current = null;
      }
    }
  }, [isOpen, isMobile, closeNav, hasSidebar]);

  const handleNavClick = useCallback(
    (e: React.MouseEvent<HTMLElement>) => {
      if (!isMobile || !closeOnNavigate) return;
      const target = e.target as HTMLElement;
      // If clicking an anchor link or button inside the sidebar, auto-close
      if (target.closest("a, button, [role='button'], [role='menuitem']")) {
        closeNav();
      }
    },
    [isMobile, closeOnNavigate, closeNav],
  );

  const contextValue: AppShellContextValue = {
    mobileNavOpen: !!isOpen,
    setMobileNavOpen: setIsOpen,
    toggleMobileNav,
    sidebarId,
  };

  return (
    <AppShellContext.Provider value={contextValue}>
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
                ref={navRef}
                id={sidebarId}
                aria-label={sidebarLabel}
                tabIndex={-1}
                data-open={isOpen ? "true" : "false"}
                className="b4-app-shell__sidebar"
                inert={isMobile && !isOpen ? true : undefined}
                aria-hidden={isMobile && !isOpen ? true : undefined}
                onClick={handleNavClick}
                style={
                  {
                    "--sidebar-width": `${sidebarWidth}px`,
                  } as React.CSSProperties
                }
              >
                {sidebar}
              </nav>
            </>
          )}
          <main className="b4-app-shell__content" inert={mobileDrawerOpen || undefined}>
            {children}
          </main>
        </div>
      </div>
    </AppShellContext.Provider>
  );
}
