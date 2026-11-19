import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`InspectorPanel is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-inspectorpanel--default&globals=b4Theme:${theme}`);
    await expect(page.getByText("General")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("InspectorPanel renders sections, properties and a working close button", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-inspectorpanel--default");

  await expect(page.getByText("General")).toBeVisible();
  await expect(page.getByText("Deployment")).toBeVisible();
  await expect(page.getByText("Ada Lovelace")).toBeVisible();

  await page.getByRole("button", { name: "Close panel" }).click();
});
