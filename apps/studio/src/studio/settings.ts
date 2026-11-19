import {
  applyB4ThemeSettings,
  b4DefaultThemeSettings,
  type B4ThemeSettings,
} from "@b4/tokens";

const STORAGE_KEY = "b4-studio-settings";

export type StudioPreviewWidth = "full" | "390" | "768" | "1440";

export interface StudioSettings extends B4ThemeSettings {
  previewWidth: StudioPreviewWidth;
}

export const defaultStudioSettings: StudioSettings = {
  ...b4DefaultThemeSettings,
  previewWidth: "full",
};

export function loadStudioSettings(): StudioSettings {
  if (typeof window === "undefined") return defaultStudioSettings;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultStudioSettings;
    return { ...defaultStudioSettings, ...JSON.parse(raw) } as StudioSettings;
  } catch {
    return defaultStudioSettings;
  }
}

export function saveStudioSettings(settings: StudioSettings): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
}

export function applyStudioSettings(settings: StudioSettings): void {
  applyB4ThemeSettings(document.documentElement, settings);
}