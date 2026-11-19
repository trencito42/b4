import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`PageHeader is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-pageheader--with-breadcrumbs-and-actions&globals=b4Theme:${theme}`);
    await expect(page.getByRole("heading", { level: 1 })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("PageHeader renders a real level-1 heading, breadcrumbs and action buttons", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-pageheader--with-breadcrumbs-and-actions");

  await expect(page.getByRole("heading", { level: 1, name: "Marketing site" })).toBeVisible();
  await expect(page.getByText("Project overview and settings.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Projects" })).toBeVisible();
  await expect(page.getByRole("button", { name: "New deployment" })).toBeVisible();
});
