import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`CodeBlock is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-d-data-content-codeblock--with-line-numbers&globals=b4Theme:${theme}`);
    await expect(page.getByRole("button", { name: "Copy code" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("CodeBlock renders the language label and the code", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-codeblock--default");
  await expect(page.getByText("javascript")).toBeVisible();
  await expect(page.locator(".b4-code-block__code")).toContainText("function greet(name)");
});

test("CodeBlock's copy button genuinely writes to the clipboard and confirms it", async ({ page, context, baseURL }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"], { origin: baseURL });
  await page.goto("/iframe.html?id=family-d-data-content-codeblock--default");

  await page.getByRole("button", { name: "Copy code" }).click();
  await expect(page.getByRole("button", { name: "Copied" })).toBeVisible();
  await expect(page.getByRole("status")).toHaveText("Copied to clipboard");

  const clipboardText = await page.evaluate(() => navigator.clipboard.readText());
  expect(clipboardText).toContain("function greet(name)");
});

test("CodeBlock renders a line number per line when requested", async ({ page }) => {
  await page.goto("/iframe.html?id=family-d-data-content-codeblock--with-line-numbers");
  await expect(page.locator(".b4-code-block__line-number")).toHaveCount(3);
});
