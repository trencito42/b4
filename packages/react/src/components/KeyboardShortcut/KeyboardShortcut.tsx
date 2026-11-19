import { forwardRef } from "react";

export interface KeyboardShortcutProps {
  /** Keys in press order, e.g. `["⌘", "K"]` or `["Ctrl", "Shift", "P"]`. */
  keys: readonly string[];
  className?: string;
}

/**
 * Renders a keyboard shortcut as a row of `<kbd>` chips — the visible
 * hint shown in menu items, tooltips, and the eventual CommandPalette.
 * Takes the exact keys to render; it does not platform-detect
 * (Mac vs. Windows modifier symbols) — pass the right symbols for the
 * current platform from the call site.
 */
export const KeyboardShortcut = forwardRef<HTMLSpanElement, KeyboardShortcutProps>(function KeyboardShortcut(
  { keys, className },
  ref,
) {
  return (
    <span ref={ref} className={["b4-keyboard-shortcut", className ?? ""].filter(Boolean).join(" ")}>
      {keys.map((key, i) => (
        <kbd className="b4-keyboard-shortcut__key" key={`${key}-${i}`}>
          {key}
        </kbd>
      ))}
    </span>
  );
});
