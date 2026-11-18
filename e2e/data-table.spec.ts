import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`DataTable is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-datatable--with-selection&globals=b4Theme:${theme}`);
    await expect(page.getByRole("table")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("DataTable sorts by clicking a sortable column header, toggling direction on repeat clicks", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datatable--default");

  const rows = page.locator(".b4-data-table tbody tr");
  await expect(rows.first()).toContainText("Billing service");

  const projectHeader = page.getByRole("button", { name: "Project" });
  await expect(page.getByRole("columnheader", { name: "Project" })).toHaveAttribute("aria-sort", "ascending");

  await projectHeader.click();
  await expect(page.getByRole("columnheader", { name: "Project" })).toHaveAttribute("aria-sort", "descending");
  await expect(rows.first()).toContainText("Mobile app");
});

test("DataTable's end-aligned column is genuinely right-aligned, not just left text that looks close", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datatable--default");

  const textAlign = await page.locator(".b4-data-table__header--end").first().evaluate((el) => getComputedStyle(el).textAlign);
  expect(textAlign).toBe("right");
});

test("DataTable selects a row via its checkbox and highlights it", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datatable--with-selection");

  const checkbox = page.getByRole("checkbox", { name: "Select Marketing site" });
  await checkbox.click();
  await expect(checkbox).toBeChecked();

  const row = page.locator("tr", { has: checkbox });
  await expect(row).toHaveAttribute("data-selected", "true");
});

test("DataTable's select-all checkbox selects every row", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-datatable--with-selection");

  await page.getByRole("checkbox", { name: "Select all rows" }).click();
  const rowCheckboxes = page.locator(".b4-data-table tbody [role=checkbox]");
  await expect(rowCheckboxes).toHaveCount(4);
  for (const checkbox of await rowCheckboxes.all()) {
    await expect(checkbox).toBeChecked();
  }
});
