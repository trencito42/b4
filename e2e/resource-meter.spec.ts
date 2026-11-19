import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`ResourceMeter is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-resourcemeter--all-tones&globals=b4Theme:${theme}`);
    await expect(page.getByRole("meter").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ResourceMeter exposes real meter semantics and auto-computed tones", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-resourcemeter--all-tones");

  const storage = page.getByRole("meter", { name: "Storage" });
  await expect(storage).toHaveAttribute("aria-valuenow", "42");
  await expect(storage).toHaveAttribute("aria-valuetext", "42 GB of 100 GB");

  await expect(page.locator(".b4-resource-meter__fill--neutral")).toBeVisible();
  await expect(page.locator(".b4-resource-meter__fill--warning")).toBeVisible();
  await expect(page.locator(".b4-resource-meter__fill--danger")).toBeVisible();
});
