import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`TransitionGroup is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-e-feedback-motion-transitiongroup--managed-list&globals=b4Theme:${theme}`,
    );
    await expect(page.getByText("Write report")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("TransitionGroup adds a new item to the real DOM when the list grows", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-transitiongroup--managed-list");

  // Scoped to the demo's own item class, not a bare "li" — Storybook's
  // preview iframe keeps its own hidden error-boundary markup (with its
  // own unrelated <li> elements) always present in the DOM regardless of
  // whether an error actually occurred, and Playwright's locators match
  // hidden elements by default for a count assertion.
  const items = page.locator("li.transition-group-demo-item");
  await expect(items).toHaveCount(3);
  await page.getByRole("button", { name: "Add item" }).click();
  await expect(items).toHaveCount(4);
  await expect(page.getByText("New task 3")).toBeVisible();
});

test("TransitionGroup removes an item from the real DOM, animating its neighbors into place", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-transitiongroup--managed-list");

  await expect(page.getByText("Review PR")).toBeVisible();
  await page.getByRole("button", { name: "Remove Review PR" }).click();

  await expect(page.getByText("Review PR")).toHaveCount(0, { timeout: 2000 });
  await expect(page.locator("li.transition-group-demo-item")).toHaveCount(2);
  await expect(page.getByText("Write report")).toBeVisible();
  await expect(page.getByText("Reply to Ada")).toBeVisible();
});
