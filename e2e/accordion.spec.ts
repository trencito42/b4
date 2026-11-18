import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Accordion is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-accordion--default-open&globals=b4Theme:${theme}`,
    );
    await expect(page.getByText(/dark\) and B4 Porcelain/)).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Accordion expands one item and collapses the previous one by default", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-accordion--default");

  await page.getByRole("button", { name: "What is B4?" }).click();
  await expect(page.getByText(/commercially distributable/)).toBeVisible();

  await page.getByRole("button", { name: "What themes does it support?" }).click();
  await expect(page.getByText(/commercially distributable/)).toHaveCount(0);
  await expect(page.getByText(/B4 Graphite \(dark\)/)).toBeVisible();
});

test("Accordion keeps multiple panels open when multiple is set", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-accordion--multiple-open");

  await expect(page.getByText(/commercially distributable/)).toBeVisible();
  await expect(page.getByText(/axe-core checks in both themes/)).toBeVisible();
});

test("Accordion disabled item cannot be expanded", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-accordion--with-disabled-item");

  const disabledTrigger = page.getByRole("button", { name: /Beta features/ });
  await expect(disabledTrigger).toBeDisabled();
});
