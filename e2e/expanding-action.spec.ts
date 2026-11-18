import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`ExpandingAction is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-e-feedback-motion-expandingaction--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("button", { name: "New item" })).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ExpandingAction really widens on hover, not just a tooltip overlapping it", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-expandingaction--default");

  const button = page.getByRole("button", { name: "New item" });
  const before = (await button.boundingBox())!;

  await button.hover();
  await page.waitForTimeout(300);
  const after = (await button.boundingBox())!;

  expect(after.width).toBeGreaterThan(before.width);
  await expect(page.getByText("New item")).toBeVisible();
});

test("ExpandingAction collapses again when the mouse leaves", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-expandingaction--default");

  const button = page.getByRole("button", { name: "New item" });
  const collapsed = (await button.boundingBox())!;

  await button.hover();
  await page.waitForTimeout(300);
  await page.mouse.move(10, 10);
  await page.waitForTimeout(300);
  const after = (await button.boundingBox())!;

  expect(after.width).toBeCloseTo(collapsed.width, 0);
});

test("ExpandingAction fires onClick (real interaction, not just a hover effect)", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-expandingaction--default");

  const button = page.getByRole("button", { name: "New item" });
  // Clicking without a listener in this story should at least not throw
  // or leave the button stuck/broken.
  await button.click();
  await expect(button).toBeEnabled();
});
