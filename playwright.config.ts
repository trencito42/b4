import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://localhost:6106",
    trace: "on-first-retry",
  },
  webServer: {
    command: "pnpm --filter @b4/studio exec storybook dev -p 6106 --ci",
    url: "http://localhost:6106",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
