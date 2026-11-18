import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`InlineAlert is axe-clean across the tone matrix on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-e-feedback-motion-inlinealert--all-tones&globals=b4Theme:${theme}`);
    await expect(page.getByRole("alert").first()).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("InlineAlert renders four distinct tones, each with its own title and message", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-inlinealert--all-tones");

  await expect(page.getByRole("alert")).toHaveCount(4);
  await expect(page.getByText("Heads up")).toBeVisible();
  await expect(page.getByText("Saved", { exact: true })).toBeVisible();
  await expect(page.getByText("Running low")).toBeVisible();
  await expect(page.getByText("Something went wrong")).toBeVisible();
});

test("InlineAlert dismisses on click of its close button", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-inlinealert--dismissible");

  await expect(page.getByRole("alert")).toBeVisible();
  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(page.getByRole("alert")).toHaveCount(0);
  await expect(page.getByText("Dismissed.")).toBeVisible();
});
