import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Sidebar is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-sidebar--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("link", { name: "Home" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Sidebar marks the active item and groups items under a real section label", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-sidebar--default");

  await expect(page.getByRole("link", { name: "Home" })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Projects" })).not.toHaveAttribute("aria-current");
  await expect(page.getByText("Account")).toBeVisible();
});

test("Sidebar items are real, independently focusable links in tab order", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-sidebar--default");

  await page.getByRole("link", { name: "Home" }).focus();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: "Projects" })).toBeFocused();
});
