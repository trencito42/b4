import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;
const base = "family-a-actions-identity-togglegroup";

for (const theme of themes) {
  test(`ToggleGroup is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${base}--all-sizes&globals=b4Theme:${theme}`);
    await expect(page.locator("#storybook-root")).not.toBeEmpty();
    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("single-select replaces the pressed item", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  const left = page.getByRole("button", { name: "Left" });
  const right = page.getByRole("button", { name: "Right" });

  await expect(left).toHaveAttribute("data-pressed", "");
  await right.click();
  await expect(right).toHaveAttribute("data-pressed", "");
  await expect(left).not.toHaveAttribute("data-pressed", "");
});

test("multiple mode keeps several items pressed at once", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--multiple`);
  const bold = page.getByRole("button", { name: "Bold" });
  const italic = page.getByRole("button", { name: "Italic" });

  await expect(bold).toHaveAttribute("data-pressed", "");
  await italic.click();
  await expect(bold).toHaveAttribute("data-pressed", "");
  await expect(italic).toHaveAttribute("data-pressed", "");
});

test("arrow keys move focus between items without changing selection", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  const left = page.getByRole("button", { name: "Left" });

  await left.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("button", { name: "Center" })).toBeFocused();

  // Roving focus must not select on move — only Enter/Space commits.
  await expect(left).toHaveAttribute("data-pressed", "");
  await expect(page.getByRole("button", { name: "Center" })).not.toHaveAttribute("data-pressed", "");

  await page.keyboard.press("Enter");
  await expect(page.getByRole("button", { name: "Center" })).toHaveAttribute("data-pressed", "");
});

test("a disabled item cannot be pressed", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--with-disabled-item`);
  const pdf = page.getByRole("button", { name: "PDF" });

  await expect(pdf).toBeDisabled();
  await pdf.click({ force: true });
  await expect(pdf).not.toHaveAttribute("data-pressed", "");
});

test("items in a group share one height and sit flush against each other", async ({ page }) => {
  // The grouped geometry is the point of this component over three loose
  // ToggleButtons: equal heights, no gaps between adjacent items.
  await page.goto(`/iframe.html?id=${base}--default`);
  const items = page.locator(".b4-toggle-group__item");
  await expect(items).toHaveCount(3);

  const boxes = await items.all();
  const rects = await Promise.all(boxes.map((item) => item.boundingBox()));
  const heights = rects.map((r) => Math.round(r!.height));
  expect(new Set(heights).size).toBe(1);

  for (let i = 1; i < rects.length; i++) {
    const gap = rects[i]!.x - (rects[i - 1]!.x + rects[i - 1]!.width);
    expect(Math.abs(gap)).toBeLessThanOrEqual(1);
  }
});

test("a vertical group stacks its items", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--vertical`);
  const items = page.locator(".b4-toggle-group__item");
  const first = await items.first().boundingBox();
  const last = await items.last().boundingBox();
  expect(last!.y).toBeGreaterThan(first!.y);
  expect(Math.round(last!.x)).toBe(Math.round(first!.x));
});
