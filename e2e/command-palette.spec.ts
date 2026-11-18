import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`CommandPalette is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-commandpalette--initially-open&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("CommandPalette opens on trigger click, filters as you type, and selects on click", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-commandpalette--default");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: /Open command palette/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  const input = page.getByRole("combobox");
  await expect(page.getByRole("option", { name: /New file/ })).toBeVisible();

  await input.fill("save");
  await expect(page.getByRole("option", { name: /^Save/ })).toBeVisible();
  await expect(page.getByRole("option", { name: /New file/ })).toHaveCount(0);

  await page.getByRole("option", { name: /^Save/ }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText("Last selected: save")).toBeVisible();
});

test("CommandPalette supports keyboard navigation and Enter to select", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-commandpalette--default");

  await page.getByRole("button", { name: /Open command palette/ }).click();
  const input = page.getByRole("combobox");
  await expect(input).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("Enter");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(page.getByText(/Last selected:/)).toBeVisible();
});

test("CommandPalette closes on Escape and on backdrop click", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-commandpalette--default");

  await page.getByRole("button", { name: /Open command palette/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: /Open command palette/ }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
