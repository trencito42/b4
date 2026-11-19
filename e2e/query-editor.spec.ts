import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`QueryEditor is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-queryeditor--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("textbox", { name: "Query" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`QueryEditor error state is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-queryeditor--with-error&globals=b4Theme:${theme}`);
    await expect(page.getByRole("alert")).toHaveText("Unclosed string.");

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("QueryEditor tokenizes what the user types and reports a broken string", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-queryeditor--default");

  const input = page.getByRole("textbox", { name: "Query" });
  await input.fill("select id from hosts");
  await expect(page.locator(".b4-query-editor__token--keyword")).toHaveCount(2);

  await input.fill("select '");
  await expect(page.getByRole("alert")).toHaveText("Unclosed string.");
  await expect(page.locator(".b4-query-editor__token--invalid")).toHaveText("'");
});
