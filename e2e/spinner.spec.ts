import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Spinner is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-e-feedback-motion-spinner--all-sizes&globals=b4Theme:${theme}`);
    await expect(page.getByRole("status").first()).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Spinner announces a custom label", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-spinner--custom-label");
  await expect(page.getByRole("status", { name: "Saving changes" })).toBeVisible();
});

test("Spinner respects reduced motion (slows rather than disappears)", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=family-e-feedback-motion-spinner--default");
  const circle = page.locator(".b4-spinner__circle");
  await expect(circle).toBeVisible();
  const duration = await circle.evaluate((el) => getComputedStyle(el).animationDuration);
  expect(duration).toBe("1.4s");
});
