import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = (theme: string, name = "default") =>
  `/iframe.html?id=family-b-forms-inputs-combobox--${name}&globals=b4Theme:${theme}`;
// "aria-hidden-focus" flags Base UI's own internal focus-guard sentinels
// (data-base-ui-focus-guard elements), deliberately aria-hidden +
// tabindex=0 to catch Tab/Shift+Tab at the popup's edges and redirect
// focus back inside it — the standard focus-sentinel technique, part of
// @base-ui/react's own implementation. See e2e/select.spec.ts for the
// same note.
const isolatedRules = [
  "page-has-heading-one",
  "landmark-one-main",
  "region",
  "aria-hidden-focus",
];
for (const theme of ["graphite", "porcelain"]) {
  for (const width of [320, 390, 768, 1440, 1920]) {
    test(`Combobox popup fits ${width}px on ${theme}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(story(theme));
      await page.getByRole("button", { name: "Show options" }).click();
      const popup = page.locator(".b4-select__popup");
      await expect(popup).toBeVisible();
      await expect
        .poll(() => popup.evaluate((el) => Number(getComputedStyle(el).opacity)))
        .toBe(1);
      const rect = await popup.boundingBox();
      expect(rect!.x).toBeGreaterThanOrEqual(0);
      expect(rect!.x + rect!.width).toBeLessThanOrEqual(width);
      expect(rect!.y + rect!.height).toBeLessThanOrEqual(800);
      expect(
        await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
      ).toBe(true);
      const results = await new AxeBuilder({ page })
        .disableRules(isolatedRules)
        .analyze();
      expect(results.violations).toEqual([]);
      await page.screenshot({
        path: test.info().outputPath(`combobox-${theme}-${width}.png`),
      });
    });
  }
  test(`Combobox filters by label, selects by keyboard and clears on ${theme}`, async ({
    page,
  }) => {
    await page.goto(story(theme));
    const input = page.getByRole("combobox", { name: "Region" });
    await input.fill("Roma");
    await expect(page.getByRole("option")).toHaveCount(1);
    await input.press("ArrowDown");
    await input.press("Enter");
    await expect(input).toHaveValue("Romania");
    await expect(input).toBeFocused();
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await page.getByRole("button", { name: "Clear selection" }).click();
    await expect(input).toHaveValue("");
    await expect(input).toBeFocused();
  });
}

test("Combobox does not expose stale options while loading", async ({ page }) => {
  await page.goto(story("graphite", "loading"));
  await page.getByRole("button", { name: "Show options" }).click();
  await expect(page.getByText("Loading options", { exact: true })).toBeVisible();
  await expect(page.getByRole("option")).toHaveCount(0);
  await expect(page.getByRole("combobox")).toHaveAttribute("aria-busy", "true");
});

test("Combobox scrolls the highlighted option into view from the keyboard", async ({
  page,
}) => {
  await page.goto(story("graphite", "long-collection"));
  const input = page.getByRole("combobox");
  for (let index = 0; index < 40; index++) await input.press("ArrowDown");
  const last = page.getByRole("option").last();
  await expect(last).toHaveAttribute("data-highlighted", "");
  await expect(last).toBeInViewport();
  await input.press("Enter");
  await expect(input).toHaveValue("Region 40");
});

test("Combobox handles interrupted exits with reduced motion and full motion", async ({
  page,
}) => {
  for (const motion of ["reduced", "full"]) {
    await page.goto(story("graphite") + `;b4Motion:${motion}`);
    const input = page.getByRole("combobox");
    for (let index = 0; index < 4; index++) {
      await input.press("ArrowDown");
      await input.press("Escape");
    }
    await input.press("ArrowDown");
    await expect(page.getByRole("listbox")).toHaveCount(1);
    await expect(page.locator(".b4-select__popup")).toHaveCount(1);
    await input.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
  }
});
