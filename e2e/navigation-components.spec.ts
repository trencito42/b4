import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Breadcrumbs is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-c-navigation-overlays-breadcrumbs--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("navigation", { name: "Breadcrumb" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`Pagination is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-pagination--many-pages&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("navigation")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`Stepper is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-c-navigation-overlays-stepper--horizontal&globals=b4Theme:${theme}`);
    await expect(page.getByRole("list", { name: "Checkout progress" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Breadcrumbs: only earlier items are real links, last item is current page", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-breadcrumbs--default");

  await expect(page.getByRole("link", { name: "Projects" })).toHaveAttribute("href", "/projects");
  await expect(page.getByText("Components", { exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("link", { name: "Components" })).toHaveCount(0);
});

test("Pagination: clicking a page number and next/prev navigates and updates aria-current", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-pagination--many-pages");

  await expect(page.getByRole("button", { name: "12", exact: true })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "Next page" }).click();
  await expect(page.getByRole("button", { name: "13", exact: true })).toHaveAttribute("aria-current", "page");

  await page.getByRole("button", { name: "1", exact: true }).click();
  await expect(page.getByRole("button", { name: "1", exact: true })).toHaveAttribute("aria-current", "page");
  await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
});

test("Pagination: prev is disabled on the first page", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-pagination--first-page");

  await expect(page.getByRole("button", { name: "Previous page" })).toBeDisabled();
  await expect(page.getByRole("button", { name: "Next page" })).toBeEnabled();
});

test("Stepper: active step carries aria-current, earlier steps read complete", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-stepper--horizontal");

  const items = page.getByRole("listitem");
  await expect(items.nth(1)).toHaveAttribute("aria-current", "step");
  await expect(items.nth(0)).toHaveClass(/b4-stepper__step--complete/);
  await expect(items.nth(2)).toHaveClass(/b4-stepper__step--upcoming/);
});
