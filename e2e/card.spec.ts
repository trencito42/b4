import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Card is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-card--all-variants&globals=b4Theme:${theme}`);
    await expect(page.locator(".b4-card").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Card renders its children", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-card--default");
  await expect(page.getByText("Card content.")).toBeVisible();
});
