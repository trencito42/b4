import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Timeline is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-timeline--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("list")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Timeline renders a real ordered list with one item per entry", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-timeline--default");

  const list = page.getByRole("list");
  await expect(list).toHaveJSProperty("tagName", "OL");
  await expect(page.getByRole("listitem")).toHaveCount(4);
  await expect(page.getByText("Deployment succeeded")).toBeVisible();
});
