import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region", "aria-hidden-focus"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`ContextMenu is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-contextmenu--default&globals=b4Theme:${theme}`,
    );
    await page.getByText("Right-click (or long-press) here").click({ button: "right" });
    await expect(page.getByRole("menu")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`HoverCard is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-hovercard--user-preview&globals=b4Theme:${theme}`,
    );
    await page.getByRole("link", { name: "@ada" }).focus();
    await expect(page.getByText("First computer programmer.")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ContextMenu does not open on a plain left-click, only right-click", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-contextmenu--default");

  await page.getByText("Right-click (or long-press) here").click();
  await expect(page.getByRole("menu")).toHaveCount(0);

  await page.getByText("Right-click (or long-press) here").click({ button: "right" });
  await expect(page.getByRole("menu")).toBeVisible();
});

test("ContextMenu selects an item and closes", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-contextmenu--default");

  await page.getByText("Right-click (or long-press) here").click({ button: "right" });
  await page.getByRole("menuitem", { name: "Rename" }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
});

test("HoverCard appears on hover and the trigger stays a real usable link", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-hovercard--user-preview");

  const trigger = page.getByRole("link", { name: "@ada" });
  await trigger.hover();
  await expect(page.getByText("First computer programmer.")).toBeVisible();
  await expect(trigger).toHaveAttribute("href", "#");
});
