import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`DatePicker is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-datepicker--with-default-value&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: /Nov 18, 2026/ }).click();
    await expect(page.getByRole("grid")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("DatePicker opens the calendar and selects a day on click, updating the trigger", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-datepicker--with-default-value");

  await expect(page.getByRole("grid")).toHaveCount(0);
  await page.getByRole("button", { name: /Nov 18, 2026/ }).click();
  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();
  await expect(page.getByText("November 2026")).toBeVisible();

  await grid.locator(`[data-date="${new Date(2026, 10, 20).toDateString()}"]`).click();
  await expect(grid).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Nov 20, 2026/ })).toBeVisible();
});

test("DatePicker navigates months with the header buttons", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-datepicker--with-default-value");

  await page.getByRole("button", { name: /Nov 18, 2026/ }).click();
  await expect(page.getByText("November 2026")).toBeVisible();

  await page.getByRole("button", { name: "Next month" }).click();
  await expect(page.getByText("December 2026")).toBeVisible();

  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(page.getByText("November 2026")).toBeVisible();
});

test("DatePicker supports keyboard navigation and Enter to select", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-datepicker--with-default-value");

  await page.getByRole("button", { name: /Nov 18, 2026/ }).press("Enter");
  const grid = page.getByRole("grid");
  await expect(grid).toBeVisible();

  const start = grid.locator(`[data-date="${new Date(2026, 10, 18).toDateString()}"]`);
  await expect(start).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");

  await expect(grid).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Nov 20, 2026/ })).toBeVisible();
});

test("DatePicker closes on Escape without changing the selected date", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-datepicker--with-default-value");

  await page.getByRole("button", { name: /Nov 18, 2026/ }).click();
  await expect(page.getByRole("grid")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("grid")).toHaveCount(0);
  await expect(page.getByRole("button", { name: /Nov 18, 2026/ })).toBeVisible();
});
