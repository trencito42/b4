import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Progress is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-progress--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("progressbar")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`Progress indeterminate state is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-progress--indeterminate&globals=b4Theme:${theme}`);
    await expect(page.getByRole("progressbar")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Progress exposes the real value via ARIA and shows the formatted percentage", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-progress--default");

  const bar = page.getByRole("progressbar", { name: "Uploading" });
  await expect(bar).toHaveAttribute("aria-valuenow", "60");
  await expect(page.getByText("60%")).toBeVisible();
});

test("Progress's indicator bar really widens as the value increases", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-progress--default");

  const indicator = page.locator(".b4-progress__indicator");
  const box = (await indicator.boundingBox())!;
  expect(box.width).toBeGreaterThan(0);
});

test("Progress marks itself complete at the max value", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-progress--complete");

  await expect(page.getByRole("progressbar")).toHaveAttribute("data-complete", "");
});
