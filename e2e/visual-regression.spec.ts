import { test, expect } from "@playwright/test";

const storybookShots = [
  { name: "button-primary-graphite", path: "/iframe.html?id=family-a-actions-identity-button--primary&globals=b4Theme:graphite", selector: ".b4-button" },
  { name: "button-primary-porcelain", path: "/iframe.html?id=family-a-actions-identity-button--primary&globals=b4Theme:porcelain", selector: ".b4-button" },
  { name: "segmented-graphite", path: "/iframe.html?id=family-a-actions-identity-segmentedcontrol--changelog-login&globals=b4Theme:graphite", selector: ".b4-segmented-control" },
  { name: "query-editor-graphite", path: "/iframe.html?id=family-f-application-patterns-queryeditor--default&globals=b4Theme:graphite", selector: ".b4-query-editor" },
] as const;

for (const shot of storybookShots) {
  test(`visual baseline (Storybook): ${shot.name}`, async ({ page }) => {
    await page.goto(shot.path, { waitUntil: "networkidle" });
    const target = page.locator(shot.selector).first();
    await expect(target).toBeVisible();
    await expect(target).toHaveScreenshot(`storybook-${shot.name}.png`, { maxDiffPixels: 300 });
  });
}

test("visual baseline (Studio): home graphite", async ({ page }) => {
  await page.goto("http://localhost:5173/");
  await expect(page.getByRole("heading", { name: /commercial-grade/i })).toBeVisible();
  await expect(page.locator(".b4-app-shell")).toHaveScreenshot("studio-home.png", { maxDiffPixels: 300 });
});