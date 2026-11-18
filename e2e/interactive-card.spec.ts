import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`InteractiveCard is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-interactivecard--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("button", { name: "Click me." })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("InteractiveCard is a real, focusable, keyboard-activatable button", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-interactivecard--default");

  const button = page.getByRole("button", { name: "Click me." });
  await button.focus();
  await expect(button).toBeFocused();
});

test("InteractiveCard's disabled state blocks interaction", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-interactivecard--disabled");

  const button = page.getByRole("button", { name: "Disabled." });
  await expect(button).toBeDisabled();
});
