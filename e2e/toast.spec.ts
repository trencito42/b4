import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Toast is axe-clean when shown on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-e-feedback-motion-toast--default&globals=b4Theme:${theme}`);
    await page.getByRole("button", { name: "Save" }).click();
    await expect(page.getByText("Changes saved")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Toast shows a title and description when triggered", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-toast--default");

  await expect(page.getByText("Changes saved")).toHaveCount(0);
  await page.getByRole("button", { name: "Save" }).click();
  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect(page.getByText("Your draft is up to date.")).toBeVisible();
});

test("Toast's action button runs its own handler and a second toast appears", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-toast--default");

  await page.getByRole("button", { name: "Delete with undo" }).click();
  await expect(page.getByText("Item deleted")).toBeVisible();

  await page.getByRole("button", { name: "Undo", exact: true }).click();
  await expect(page.getByText("Delete undone")).toBeVisible();
});

test("Toast dismisses via its close button on hover", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-toast--default");

  await page.getByRole("button", { name: "Save" }).click();
  const toast = page.getByText("Changes saved");
  await expect(toast).toBeVisible();

  await toast.hover();
  await page.getByRole("button", { name: "Dismiss" }).click();
  await expect(toast).toHaveCount(0);
});

test("Toast supports multiple simultaneous toasts, stacked", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-toast--default");

  await page.getByRole("button", { name: "Save" }).click();
  await page.getByRole("button", { name: "Fail" }).click();

  await expect(page.getByText("Changes saved")).toBeVisible();
  await expect(page.getByText("Upload failed")).toBeVisible();
});

test("Toast's promise() helper transitions from loading to success", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-toast--default");

  await page.getByRole("button", { name: "Async (promise)" }).click();
  await expect(page.getByText("Uploading…")).toBeVisible();
  await expect(page.getByText("Upload complete")).toBeVisible({ timeout: 5000 });
});
