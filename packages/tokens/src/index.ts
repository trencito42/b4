/**
 * @b4/tokens — typed accessors for the B4 token contract.
 * The CSS files in this package are the source of truth; these exports exist
 * so component code and the Studio theme configurator never hardcode a
 * variable name string more than once.
 */

export const b4Themes = ["graphite", "porcelain"] as const;
export type B4Theme = (typeof b4Themes)[number];

export const b4Densities = ["compact", "comfortable", "spacious"] as const;
export type B4Density = (typeof b4Densities)[number];

export const b4RadiusModes = ["tight", "default", "round"] as const;
export type B4RadiusMode = (typeof b4RadiusModes)[number];

export const b4ContrastModes = ["default", "high"] as const;
export type B4ContrastMode = (typeof b4ContrastModes)[number];

export const b4MotionModes = ["system", "full", "reduced"] as const;
export type B4MotionMode = (typeof b4MotionModes)[number];

export interface B4ThemeSettings {
  theme: B4Theme;
  density: B4Density;
  radius: B4RadiusMode;
  contrast: B4ContrastMode;
  motion: B4MotionMode;
}

export const b4DefaultThemeSettings: B4ThemeSettings = {
  theme: "graphite",
  density: "comfortable",
  radius: "default",
  contrast: "default",
  motion: "system",
};

/**
 * Applies theme settings to a root element via `data-b4-*` attributes —
 * the same attributes the CSS in this package selects on. `radius: "default"`
 * and `motion: "system"` are represented by the *absence* of the attribute,
 * matching the CSS default rules in base.css.
 */
export function applyB4ThemeSettings(
  element: HTMLElement,
  settings: B4ThemeSettings,
): void {
  element.setAttribute("data-b4-theme", settings.theme);
  element.setAttribute("data-b4-density", settings.density);
  element.setAttribute("data-b4-contrast", settings.contrast);

  if (settings.radius === "default") {
    element.removeAttribute("data-b4-radius");
  } else {
    element.setAttribute("data-b4-radius", settings.radius);
  }

  if (settings.motion === "system") {
    element.removeAttribute("data-b4-motion");
  } else {
    element.setAttribute("data-b4-motion", settings.motion);
  }
}
