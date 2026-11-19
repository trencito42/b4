import { useEffect, useState } from "react";
import { ButtonGroup, ToggleButton } from "@b4/react";

export type B4Theme = "graphite" | "porcelain";

const THEME_STORAGE_KEY = "b4-storefront.theme";

function readStoredTheme(): B4Theme {
  if (typeof window === "undefined") return "graphite";
  try {
    return window.localStorage.getItem(THEME_STORAGE_KEY) === "porcelain" ? "porcelain" : "graphite";
  } catch {
    return "graphite";
  }
}

/**
 * Drives the `data-b4-theme` attribute on `<html>` — the same contract the
 * B4 token themes are built around, so switching themes re-resolves every
 * `var(--b4-*)` token in the app rather than swapping a stylesheet.
 */
export function useB4Theme() {
  const [theme, setTheme] = useState<B4Theme>(readStoredTheme);

  useEffect(() => {
    document.documentElement.setAttribute("data-b4-theme", theme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* Storage is optional — the theme still applies for this session. */
    }
  }, [theme]);

  return { theme, setTheme };
}

/**
 * The theme switch is a `ButtonGroup` of two `ToggleButton`s rather than a
 * `SegmentedControl`: the pressed state is a real surface (never colour
 * alone), and a plain mouse click commits the change.
 */
export function ThemeToggle({
  theme,
  onThemeChange,
}: {
  theme: B4Theme;
  onThemeChange: (theme: B4Theme) => void;
}) {
  return (
    <ButtonGroup aria-label="Colour theme">
      <ToggleButton
        size="sm"
        pressed={theme === "graphite"}
        onPressedChange={(pressed) => {
          if (pressed) onThemeChange("graphite");
        }}
      >
        Graphite
      </ToggleButton>
      <ToggleButton
        size="sm"
        pressed={theme === "porcelain"}
        onPressedChange={(pressed) => {
          if (pressed) onThemeChange("porcelain");
        }}
      >
        Porcelain
      </ToggleButton>
    </ButtonGroup>
  );
}
