import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`BorderBeam is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=effects-borderbeam--tones&globals=b4Theme:${theme}`);
    await expect(page.locator(".b4-border-beam__ring").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("BorderBeam's ring never intercepts pointer events — clicking through it still works", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-borderbeam--default");

  const ring = page.locator(".b4-border-beam__ring").first();
  const pointerEvents = await ring.evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(pointerEvents).toBe("none");
});

test("BorderBeam genuinely animates — the gradient layer's transform changes over time", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-borderbeam--default");

  const gradient = page.locator(".b4-border-beam__gradient").first();
  const transform1 = await gradient.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(800);
  const transform2 = await gradient.evaluate((el) => getComputedStyle(el).transform);

  expect(transform1).not.toBe(transform2);
});

test("BorderBeam renders no ring element at all when inactive", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-borderbeam--inactive");
  await expect(page.locator(".b4-border-beam__ring")).toHaveCount(0);
});

test("BorderBeam collapses to a static, non-animating ring under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=effects-borderbeam--default");

  const gradient = page.locator(".b4-border-beam__gradient").first();
  const transform1 = await gradient.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(800);
  const transform2 = await gradient.evaluate((el) => getComputedStyle(el).transform);

  expect(transform1).toBe(transform2);
});

test("BorderBeam causes no layout shift — the wrapper's box exactly matches its child, despite the absolutely-positioned ring sibling", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-borderbeam--default");

  const wrapperBox = await page.locator(".b4-border-beam").first().boundingBox();
  const childBox = await page.locator(".b4-border-beam > .b4-card").first().boundingBox();

  expect(wrapperBox?.width).toBe(childBox?.width);
  expect(wrapperBox?.height).toBe(childBox?.height);
});
