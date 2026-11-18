import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`ActivityFeed is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-activityfeed--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("list")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ActivityFeed renders each entry's actor avatar and action text", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-activityfeed--default");

  await expect(page.getByRole("img", { name: "Ada Lovelace" })).toBeVisible();
  await expect(page.getByText("merged pull request #248")).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(3);
});
