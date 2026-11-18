import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Skeleton is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-skeleton--all-variants&globals=b4Theme:${theme}`);
    await expect(page.locator(".b4-skeleton").first()).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Skeleton is hidden from the accessibility tree (purely decorative)", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-skeleton--all-variants");

  const skeletons = page.locator(".b4-skeleton");
  await expect(skeletons.first()).toHaveAttribute("aria-hidden", "true");
});

test("Skeleton respects reduced motion by dropping the shimmer animation", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=family-d-data-content-skeleton--all-variants");

  const skeleton = page.locator(".b4-skeleton").first();
  const animationName = await skeleton.evaluate((el) => getComputedStyle(el).animationName);
  expect(animationName).toBe("none");
});
