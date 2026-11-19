import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`FilterBar is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-filterbar--default&globals=b4Theme:${theme}`);
    await expect(page.getByText("Status: Active")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("FilterBar removes a chip on click and updates the list in the real DOM", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-filterbar--default");

  await expect(page.getByText("Status: Active")).toBeVisible();
  await page.getByRole("button", { name: "Remove filter: Status: Active" }).click();

  await expect(page.getByText("Status: Active")).toHaveCount(0);
  await expect(page.getByText("Owner: Ada Lovelace")).toBeVisible();
});

test("FilterBar's Clear all removes every chip", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-filterbar--default");

  await page.getByRole("button", { name: "Clear all" }).click();

  await expect(page.getByRole("list", { name: "Active filters" })).toHaveCount(0);
});
