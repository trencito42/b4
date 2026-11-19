import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

const stories = [
  { id: "family-g-layout-primitives-separator--default", name: "Separator" },
  { id: "family-g-layout-primitives-visuallyhidden--default", name: "VisuallyHidden" },
  { id: "family-g-layout-primitives-aspectratio--default", name: "AspectRatio" },
  { id: "family-g-layout-primitives-collapsible--default", name: "Collapsible" },
  { id: "family-g-layout-primitives-scrollarea--default", name: "ScrollArea" },
];

for (const story of stories) {
  for (const theme of themes) {
    test(`${story.name} is axe-clean on ${theme}`, async ({ page }) => {
      await page.goto(`/iframe.html?id=${story.id}&globals=b4Theme:${theme}`);
      await expect(page.locator("#storybook-root")).not.toBeEmpty();
      const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
      expect(results.violations).toEqual([]);
    });
  }
}

test("Separator renders role=separator with the right orientation", async ({ page }) => {
  await page.goto("/iframe.html?id=family-g-layout-primitives-separator--all-orientations");
  const separators = page.getByRole("separator");
  await expect(separators).toHaveCount(2);
  await expect(separators.first()).toHaveAttribute("aria-orientation", "horizontal");
  await expect(separators.last()).toHaveAttribute("aria-orientation", "vertical");
});

test("VisuallyHidden content is in the DOM but clipped from sighted view", async ({ page }) => {
  // Playwright's `toBeVisible` only checks display/visibility/opacity and
  // zero-size, not a 1x1px clip-rect box — the standard visually-hidden
  // technique has non-zero size on purpose (zero-size is sometimes
  // ignored by screen readers). Assert the actual clipping styles.
  await page.goto("/iframe.html?id=family-g-layout-primitives-visuallyhidden--default");
  const hidden = page.getByText("Add item");
  await expect(hidden).toBeAttached();
  const box = await hidden.boundingBox();
  expect(box?.width).toBeLessThanOrEqual(1);
  expect(box?.height).toBeLessThanOrEqual(1);
  const overflow = await hidden.evaluate((el) => getComputedStyle(el).overflow);
  expect(overflow).toBe("hidden");
});

test("Collapsible expands and collapses on trigger click", async ({ page }) => {
  await page.goto("/iframe.html?id=family-g-layout-primitives-collapsible--default");
  const trigger = page.getByRole("button", { name: "Advanced options" });
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  await trigger.click();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("ScrollArea content scrolls within a bounded viewport", async ({ page }) => {
  await page.goto("/iframe.html?id=family-g-layout-primitives-scrollarea--default");
  const viewport = page.locator(".b4-scroll-area__viewport");
  await expect(viewport).toBeVisible();
  const scrollableHeight = await viewport.evaluate((el) => el.scrollHeight > el.clientHeight);
  expect(scrollableHeight).toBe(true);
});

test("AspectRatio keeps a fixed width/height ratio regardless of content", async ({ page }) => {
  await page.goto("/iframe.html?id=family-g-layout-primitives-aspectratio--default");
  const box = await page.locator(".b4-aspect-ratio").first().boundingBox();
  expect(box).not.toBeNull();
  if (box) {
    const ratio = box.width / box.height;
    expect(Math.abs(ratio - 16 / 9)).toBeLessThan(0.05);
  }
});
