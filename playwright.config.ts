import { defineConfig, devices } from "@playwright/test";

const storybookCommand =
  process.platform === "win32"
    ? "apps\\studio\\node_modules\\.bin\\storybook.cmd dev -p 6106 --ci"
    : "pnpm --filter @b4/studio exec storybook dev -p 6106 --ci";

const studioPreviewCommand =
  process.platform === "win32"
    ? "cmd /c cd apps\\studio && ..\\..\\node_modules\\.bin\\vite.cmd preview --port 5173 --strictPort"
    : "pnpm --filter @b4/studio exec vite preview --port 5173 --strictPort";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  workers: 3,
  reporter: "list",
  expect: {
    toHaveScreenshot: {
      maxDiffPixelRatio: 0.05,
      threshold: 0.2,
      animations: "disabled",
    },
  },
  use: {
    baseURL: "http://localhost:6106",
    trace: "on-first-retry",
  },
  webServer: [
    {
      command: storybookCommand,
      cwd: process.cwd(),
      url: "http://localhost:6106",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: studioPreviewCommand,
      cwd: process.cwd(),
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});