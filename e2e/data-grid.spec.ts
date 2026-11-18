import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`DataGrid is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-datagrid--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("grid")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("DataGrid genuinely virtualizes: far fewer DOM rows exist than the 500 data rows", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datagrid--default");
  await expect(page.getByText("Item 1", { exact: true })).toBeVisible();

  const rowCount = await page.locator('[role="row"]').count();
  expect(rowCount).toBeGreaterThan(0);
  expect(rowCount).toBeLessThan(40);
  await expect(page.getByText("Item 499", { exact: true })).toHaveCount(0);
});

test("DataGrid renders different rows after a real scroll", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datagrid--default");
  const grid = page.getByRole("grid");
  await expect(page.getByText("Item 1", { exact: true })).toBeVisible();

  await grid.evaluate((el) => {
    el.scrollTop = 4000;
    el.dispatchEvent(new Event("scroll", { bubbles: true }));
  });

  await expect(page.getByText("Item 1", { exact: true })).toHaveCount(0);
  await expect(page.getByText("Item 101", { exact: true })).toBeVisible();
});

test("DataGrid sorts by a clicked column header and resets scroll to the top", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datagrid--default");
  const grid = page.getByRole("grid");

  await grid.evaluate((el) => {
    el.scrollTop = 4000;
    el.dispatchEvent(new Event("scroll", { bubbles: true }));
  });
  await expect(page.getByText("Item 101", { exact: true })).toBeVisible();

  await page.getByRole("button", { name: "Price" }).click();
  await expect(page.getByRole("columnheader", { name: "Price" })).toHaveAttribute("aria-sort", "ascending");
  await expect.poll(() => grid.evaluate((el) => el.scrollTop)).toBe(0);
});

test("DataGrid filters rows by the quick-filter text", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datagrid--default");

  await page.getByRole("searchbox", { name: "Filter" }).fill("Item 42");
  await expect(page.getByText("Item 42", { exact: true })).toBeVisible();
  await expect(page.getByText("Item 1", { exact: true })).toHaveCount(0);
});

test("DataGrid shows a real empty state when no rows match the filter", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datagrid--default");

  await page.getByRole("searchbox", { name: "Filter" }).fill("nonexistent-query-xyz");
  await expect(page.getByText("No matching rows")).toBeVisible();
  await expect(page.locator('[role="gridcell"]')).toHaveCount(0);
});
