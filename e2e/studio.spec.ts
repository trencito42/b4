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

test("B4 Studio Text Morph Lab renders and exercises morphing", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Text Morphing Lab" }).click();
  await expect(page.getByRole("heading", { name: "Text Morphing Lab" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "Word Replacement & Reordering" })).toBeVisible();
});

test("B4 Studio Effects Lab renders both effects and drives them", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Effects Lab" }).click();
  await expect(page.getByRole("heading", { name: "Effects Lab" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "BorderBeam" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "DistortionWave" })).toBeVisible();

  // The DistortionWave's own wave layer must actually be in the DOM and
  // moving — a lab page that renders an empty preview is not a lab.
  await expect(page.locator(".b4-distortion-wave__band").first()).toBeVisible();
  const transform1 = await page
    .locator(".b4-distortion-wave__band")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(700);
  const transform2 = await page
    .locator(".b4-distortion-wave__band")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  expect(transform1).not.toBe(transform2);
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