import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`ChartContainer is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-chartcontainer--with-actions&globals=b4Theme:${theme}`);
    await expect(page.getByText("Revenue vs. costs")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ChartContainer renders its title, legend and chart content", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-chartcontainer--default");

  await expect(page.getByText("Revenue vs. costs")).toBeVisible();
  await expect(page.getByText("Last 6 quarters")).toBeVisible();
  await expect(page.getByRole("img", { name: "Revenue and costs by quarter" })).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(2);
});

test("ChartContainer renders a real, usable action control", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-chartcontainer--with-actions");
  await expect(page.getByRole("button", { name: "Export" })).toBeVisible();
});
