import type { StorybookConfig } from "@storybook/react-vite";

const config: StorybookConfig = {
  stories: ["../../../packages/react/src/**/*.stories.@(ts|tsx)"],
  addons: ["@storybook/addon-docs", "@storybook/addon-a11y"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  docs: {
    defaultName: "Docs",
  },
  core: {
    disableTelemetry: true,
  },
  async viteFinal(viteConfig) {
    viteConfig.server = {
      ...viteConfig.server,
      host: true,
      strictPort: true,
      allowedHosts: true,
    };
    return viteConfig;
  },
};

export default config;
