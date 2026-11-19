import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`AppShell is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-appshell--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("main")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("AppShell renders real header, sidebar and main landmarks", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-appshell--default");

  await expect(page.getByRole("banner")).toHaveText("B4 Studio");
  await expect(page.getByRole("navigation")).toContainText("Projects");
  await expect(page.getByRole("main")).toContainText("Main content area.");
});

test("AppShell renders without a sidebar landmark when none is passed", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-appshell--header-only");

  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("navigation")).toHaveCount(0);
  await expect(page.getByRole("main")).toBeVisible();
});

test("AppShell clamps a wide sidebar to the mobile viewport", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/iframe.html?id=family-f-application-patterns-appshell--adaptive-mobile");
  await page.getByRole("button", { name: "Toggle navigation menu" }).click();
  await expect(page.getByRole("navigation")).toHaveCSS("width", "272px");
});
