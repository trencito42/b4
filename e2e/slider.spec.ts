import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Slider range story is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-b-forms-inputs-slider--range&globals=b4Theme:${theme}`);
    await expect(page.getByRole("slider").first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Slider responds to arrow keys in a real browser", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-slider--default");

  const thumb = page.getByRole("slider", { name: "Volume" });
  await thumb.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");

  await expect(thumb).toHaveAttribute("aria-valuenow", "42");
});
