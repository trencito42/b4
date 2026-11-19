import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  // A single Storybook dev server under heavy parallel axe-core load can
  // flake with "Execution context was destroyed" errors that are a test-
  // infra timing issue, not a product bug — keeping worker count modest
  // avoids it. See TESTING.md.
  workers: 3,
  reporter: "list",
  use: {
    baseURL: "http://localhost:6106",
    trace: "on-first-retry",
  },
  webServer: {
    command:
      process.platform === "win32"
        ? "apps\\studio\\node_modules\\.bin\\storybook.cmd dev -p 6106 --ci"
        : "pnpm --filter @b4/studio exec storybook dev -p 6106 --ci",
    cwd: process.cwd(),
    url: "http://localhost:6106",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
  ],
});
