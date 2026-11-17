import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`IconButton all-sizes story is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-a-actions-identity-iconbutton--all-sizes&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("button").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`ToggleButton is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-a-actions-identity-togglebutton--unpressed&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("button")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ToggleButton toggles pressed state in a real browser", async ({ page }) => {
  await page.goto("/iframe.html?id=family-a-actions-identity-togglebutton--unpressed");

  const button = page.getByRole("button", { name: "Mute" });
  await expect(button).not.toHaveAttribute("data-pressed");
  await button.click();
  await expect(button).toHaveAttribute("data-pressed");
});
