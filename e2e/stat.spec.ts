import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Stat is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-stat--all-trends&globals=b4Theme:${theme}`);
    await expect(page.locator(".b4-stat").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Stat renders its label, value and trend", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-stat--default");
  await expect(page.getByText("Monthly active users")).toBeVisible();
  await expect(page.getByText("48,201")).toBeVisible();
  await expect(page.getByText("+12%")).toBeVisible();
});
