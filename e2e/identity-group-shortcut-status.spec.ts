import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

/**
 * The three Family A components that had no browser-level coverage at all:
 * a grouping control, a keyboard hint, and a status indicator. Each one
 * is small, which is exactly why an untested small component rots
 * quietly — so each gets a real rendered check here, including the
 * contrast pass that jsdom cannot do.
 */
for (const theme of themes) {
  test(`ButtonGroup is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-a-actions-identity-buttongroup--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("group")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`KeyboardShortcut is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-a-actions-identity-keyboardshortcut--default&globals=b4Theme:${theme}`);
    await expect(page.locator("kbd").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`StatusBadge is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-a-actions-identity-statusbadge--default&globals=b4Theme:${theme}`);
    await expect(page.getByText("Connected")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ButtonGroup joins its buttons into one group with an accessible name", async ({ page }) => {
  await page.goto("/iframe.html?id=family-a-actions-identity-buttongroup--default");
  const group = page.getByRole("group");
  await expect(group).toBeVisible();
  await expect(group).toHaveAttribute("aria-label", /.+/);
});

test("ButtonGroup's buttons stay real buttons and remain individually clickable", async ({ page }) => {
  await page.goto("/iframe.html?id=family-a-actions-identity-buttongroup--default");
  const buttons = page.getByRole("button");
  await expect(buttons.first()).toBeVisible();
  expect(await buttons.count()).toBeGreaterThan(1);
  await expect(buttons.first()).toBeEnabled();
});

test("KeyboardShortcut renders every key in order as a kbd chip", async ({ page }) => {
  await page.goto("/iframe.html?id=family-a-actions-identity-keyboardshortcut--default");
  const keys = page.locator("kbd");
  // The Mac example is ⌘ K — one chip per key, in press order.
  await expect(keys).toHaveCount(2);
  await expect(keys.first()).toHaveText("⌘");
  await expect(keys.last()).toHaveText("K");
});

test("StatusBadge states its status in text, never in colour alone", async ({ page }) => {
  await page.goto("/iframe.html?id=family-a-actions-identity-statusbadge--all-statuses");
  // Every status must carry a visible label, not just a coloured dot.
  for (const label of ["Connected", "Degraded performance", "Offline", "Idle"]) {
    await expect(page.getByText(label, { exact: true })).toBeVisible();
  }
});
