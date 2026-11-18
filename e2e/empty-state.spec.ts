import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`EmptyState is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-emptystate--with-action&globals=b4Theme:${theme}`);
    await expect(page.getByText("No projects yet")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("EmptyState's action is a real, usable button", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-emptystate--with-action");
  await expect(page.getByRole("button", { name: "New project" })).toBeVisible();
});
