import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Toolbar is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-toolbar--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("toolbar")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Toolbar supports real arrow-key roving-tabindex navigation between items", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-toolbar--default");

  await page.getByRole("button", { name: "Bold" }).focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Italic" })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Insert link" })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Publish" })).toBeFocused();
});

test("Toolbar items are genuinely clickable", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-toolbar--default");
  await page.getByRole("button", { name: "Publish" }).click();
});
