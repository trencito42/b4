import { defineConfig, devices } from "@playwright/test";

// cwd is set per-entry below (apps/studio), so these run as plain relative
// commands there — no `cmd /c cd X && Y` chaining, which was intermittently
// failing to resolve on Windows (flaky "not recognized"/"cannot find path"
// errors depending on how the parent shell invoked it).
const storybookCommand =
  process.platform === "win32"
    ? "node_modules\\.bin\\storybook.cmd dev -p 6106 --ci"
    : "pnpm exec storybook dev -p 6106 --ci";

const studioPreviewCommand =
  process.platform === "win32"
    ? "node_modules\\.bin\\vite.cmd preview --port 5173 --strictPort"
    : "pnpm exec vite preview --port 5173 --strictPort";

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
      cwd: `${process.cwd()}/apps/studio`,
      url: "http://localhost:6106",
      reuseExistingServer: !process.env.CI,
      timeout: 120_000,
    },
    {
      command: studioPreviewCommand,
      cwd: `${process.cwd()}/apps/studio`,
      url: "http://localhost:5173",
      reuseExistingServer: !process.env.CI,
      timeout: 90_000,
    },
  ],
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
});