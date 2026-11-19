import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`FileExplorer is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-fileexplorer--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("tree", { name: "Project files" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("FileExplorer expands a folder with the keyboard and reveals its files", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-fileexplorer--default");

  await expect(page.getByText("index.ts")).toBeVisible();
  await expect(page.getByText("Button.tsx")).toHaveCount(0);

  const folder = page.getByRole("treeitem", { name: "components" });
  await folder.click();
  await folder.press("ArrowRight");

  await expect(page.getByText("Button.tsx")).toBeVisible();
  await expect(page.getByText("Button.css")).toBeVisible();
});
