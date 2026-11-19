import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Calendar is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-calendar--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("grid")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Calendar renders real event text, not color alone, and marks today", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-calendar--default");

  await expect(page.getByText("Standup")).toBeVisible();
  await expect(page.getByText("Launch review")).toBeVisible();
  await expect(page.locator('[aria-current="date"]')).toBeVisible();
});

test("Calendar collapses extra events into a real '+N more' indicator", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-calendar--default");
  await expect(page.getByText("+1 more")).toBeVisible();
});

test("Calendar navigates months with the header buttons", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-calendar--default");

  const monthLabel = page.locator(".b4-calendar__month-label");
  const initial = await monthLabel.textContent();

  await page.getByRole("button", { name: "Next month" }).click();
  await expect(monthLabel).not.toHaveText(initial ?? "");

  await page.getByRole("button", { name: "Previous month" }).click();
  await expect(monthLabel).toHaveText(initial ?? "");
});

test("Calendar supports arrow-key navigation across the grid", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-calendar--default");

  const grid = page.getByRole("grid");
  const focusable = grid.locator('button[tabindex="0"]');
  await focusable.focus();
  const startDate = await focusable.getAttribute("data-date");

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");

  const nowFocused = await page.evaluate(() => document.activeElement?.getAttribute("data-date"));
  expect(nowFocused).not.toBe(startDate);
});
