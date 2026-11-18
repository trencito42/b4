import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`CircularProgress is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-circularprogress--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("progressbar")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`CircularProgress indeterminate state is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-d-data-content-circularprogress--indeterminate&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("progressbar")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("CircularProgress exposes the real value via ARIA and shows the formatted percentage", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-circularprogress--default");

  const bar = page.getByRole("progressbar", { name: "Uploading" });
  await expect(bar).toHaveAttribute("aria-valuenow", "60");
  await expect(page.getByText("60%")).toBeVisible();
});

test("CircularProgress's ring really changes stroke-dashoffset with a different value", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-circularprogress--default");
  const lowOffset = await page.locator(".b4-circular-progress__indicator").getAttribute("stroke-dashoffset");

  await page.goto("/iframe.html?id=family-d-data-content-circularprogress--large");
  const highOffset = await page.locator(".b4-circular-progress__indicator").getAttribute("stroke-dashoffset");

  expect(Number(highOffset)).not.toBe(Number(lowOffset));
});

test("CircularProgress respects a custom size", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-circularprogress--large");

  const svg = page.locator(".b4-circular-progress__svg");
  await expect(svg).toHaveAttribute("width", "96");
});
