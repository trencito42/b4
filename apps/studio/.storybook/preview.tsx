import type { Preview } from "@storybook/react-vite";
import React, { useEffect } from "react";
import "../../../packages/tokens/src/index.css";
import "../../../packages/react/src/styles.css";
import { applyB4ThemeSettings, b4DefaultThemeSettings } from "@b4/tokens";
import type { B4Theme } from "@b4/tokens";

const preview: Preview = {
  parameters: {
    layout: "centered",
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
  },
  decorators: [
    (Story, context) => {
      const theme = (context.globals.b4Theme as B4Theme) ?? b4DefaultThemeSettings.theme;

      useEffect(() => {
        applyB4ThemeSettings(document.documentElement, {
          ...b4DefaultThemeSettings,
          theme,
        });
      }, [theme]);

      return (
        <div
          style={{
            background: "var(--b4-surface-canvas)",
            color: "var(--b4-text-primary)",
            padding: 32,
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
