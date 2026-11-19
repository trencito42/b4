import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const studioOrigin = "http://localhost:5173";

test("B4 Studio home loads with landmarks", async ({ page }) => {
  await page.goto(studioOrigin);
  await expect(page.getByRole("heading", { name: /commercial-grade/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Studio" })).toBeVisible();
});

test("B4 Studio catalog lists components", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Components" }).click();
  await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Button Verified", exact: true })).toBeVisible();
});

test("B4 Studio Analytics showcase renders", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Analytics" }).click();
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await expect(page.getByText("Requests", { exact: true })).toBeVisible();
});

test("B4 Studio Motion Lab renders and exercises async action", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Motion Lab" }).click();
  await expect(page.getByRole("heading", { name: "Motion Lab" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Deploy to production/i })).toBeVisible();
});

for (const theme of ["graphite", "porcelain"] as const) {
  test(`B4 Studio home is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(studioOrigin);
    await page.getByRole("button", { name: theme === "graphite" ? "Graphite" : "Porcelain" }).click();
    await expect(page.getByRole("heading", { name: /commercial-grade/i })).toBeVisible();
    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}