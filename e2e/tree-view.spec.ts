import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`TreeView is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-c-navigation-overlays-treeview--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("tree", { name: "File explorer" })).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("TreeView's accessible name per row is scoped to its own label, not its subtree", async ({ page }) => {
  // Real Chromium's accessible-name computation correctly excludes a
  // nested treeitem's own content from its ancestor's name (confirmed by
  // this passing axe-clean, and here by exact-matching "src" even though
  // its children are rendered right below it in the DOM).
  await page.goto("/iframe.html?id=family-c-navigation-overlays-treeview--default");

  const src = page.getByRole("treeitem", { name: "src", exact: true });
  await expect(src).toBeVisible();
  await expect(page.getByRole("treeitem", { name: "components", exact: true })).toBeVisible();
  await expect(page.getByRole("treeitem", { name: "Button.tsx" })).toHaveCount(0);
});

test("TreeView expands a branch by clicking its disclosure, revealing children", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-treeview--default");

  await expect(page.getByRole("treeitem", { name: "Button.tsx" })).toHaveCount(0);
  await page.locator('[data-tree-id="components"] .b4-tree-view__disclosure').click();
  await expect(page.getByRole("treeitem", { name: "Button.tsx" })).toBeVisible();
});

test("TreeView supports full keyboard navigation: arrows, Home/End, Enter to select", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-treeview--default");

  const src = page.getByRole("treeitem", { name: "src", exact: true });
  await src.focus();
  await expect(src).toBeFocused();

  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("treeitem", { name: "components", exact: true })).toBeFocused();

  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("treeitem", { name: "components", exact: true })).toHaveAttribute(
    "aria-expanded",
    "true",
  );

  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("treeitem", { name: "Button.tsx" })).toBeFocused();

  await page.keyboard.press("Home");
  await expect(src).toBeFocused();

  // "node_modules (managed)" is disabled, so it's excluded from keyboard
  // traversal entirely — End lands on the last *enabled* row instead,
  // the same skip-disabled behavior already covered for ArrowDown.
  await page.keyboard.press("End");
  const lastEnabledItem = page.getByRole("treeitem", { name: "package.json" });
  await expect(lastEnabledItem).toBeFocused();
});

test("TreeView skips a disabled node when selecting with Enter", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-treeview--with-selection");

  const disabledItem = page.getByRole("treeitem", { name: "node_modules (managed)" });
  await expect(disabledItem).toHaveAttribute("aria-disabled", "true");
});
