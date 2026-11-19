import type { Preview } from "@storybook/react-vite";
import React, { useEffect } from "react";
import "../../../packages/tokens/src/index.css";
import "../../../packages/react/src/styles.css";
import "./preview.css";
import { applyB4ThemeSettings, b4DefaultThemeSettings } from "@b4/tokens";
import type {
  B4Theme,
  B4Density,
  B4RadiusMode,
  B4ContrastMode,
  B4MotionMode,
} from "@b4/tokens";

const preview: Preview = {
  parameters: {
    layout: "centered",
    a11y: {
      test: "off",
      disable: true,
    },
    options: {
      storySort: {
        order: [
          "Family A — Actions & Identity",
          "Family B — Forms & Inputs",
          "Family C — Navigation & Overlays",
          "Family D — Data & Content",
          "Family E — Feedback & Motion",
          "Family F — Application Patterns",
        ],
      },
    },
  },
  globalTypes: {
    b4Density: {
      description: "Control density",
      toolbar: {
        title: "Density",
        icon: "component",
        items: ["compact", "comfortable", "spacious"],
        dynamicTitle: true,
      },
    },
    b4Radius: {
      description: "Corner radius",
      toolbar: {
        title: "Radius",
        icon: "contrast",
        items: ["tight", "default", "round"],
        dynamicTitle: true,
      },
    },
    b4Contrast: {
      description: "Contrast",
      toolbar: {
        title: "Contrast",
        icon: "circlehollow",
        items: ["default", "high"],
        dynamicTitle: true,
      },
    },
    b4Motion: {
      description: "Motion",
      toolbar: {
        title: "Motion",
        icon: "play",
        items: ["system", "full", "reduced"],
        dynamicTitle: true,
      },
    },
    b4Theme: {
      description: "B4 theme",
      toolbar: {
        title: "Theme",
        icon: "mirror",
        items: [
          { value: "graphite", title: "Graphite (dark)" },
          { value: "porcelain", title: "Porcelain (light)" },
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    b4Theme: b4DefaultThemeSettings.theme,
    b4Density: b4DefaultThemeSettings.density,
    b4Radius: b4DefaultThemeSettings.radius,
    b4Contrast: b4DefaultThemeSettings.contrast,
    b4Motion: b4DefaultThemeSettings.motion,
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.b4Theme as B4Theme) ?? b4DefaultThemeSettings.theme;
      const density =
        (context.globals.b4Density as B4Density) ?? b4DefaultThemeSettings.density;
      const radius =
        (context.globals.b4Radius as B4RadiusMode) ?? b4DefaultThemeSettings.radius;
      const contrast =
        (context.globals.b4Contrast as B4ContrastMode) ?? b4DefaultThemeSettings.contrast;
      const motion =
        (context.globals.b4Motion as B4MotionMode) ?? b4DefaultThemeSettings.motion;

      useEffect(() => {
        applyB4ThemeSettings(document.documentElement, {
          ...b4DefaultThemeSettings,
          theme,
          density,
          radius,
          contrast,
          motion,
        });
      }, [theme, density, radius, contrast, motion]);

      return (
        <div
          style={{
            background: "var(--b4-surface-canvas)",
            color: "var(--b4-text-primary)",
            padding: "var(--b4-space-10)",
            fontFamily: "var(--b4-font-sans)",
          }}
        >
          <Story />
        </div>
      );
    },
  ],
};

export default preview;
