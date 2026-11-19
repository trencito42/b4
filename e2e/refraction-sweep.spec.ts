import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`RefractionSweep is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=effects-refractionsweep--tones&globals=b4Theme:${theme}`);
    await expect(page.locator(".b4-refraction-sweep__band").first()).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("RefractionSweep genuinely animates — the band's transform changes over time", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-refractionsweep--default");

  const band = page.locator(".b4-refraction-sweep__band").first();
  const transform1 = await band.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(800);
  const transform2 = await band.evaluate((el) => getComputedStyle(el).transform);

  expect(transform1).not.toBe(transform2);
});

test("RefractionSweep really refracts the content beneath it — the rendered pixels differ from the un-effected render", async ({
  page,
}) => {
  // Freeze the band dead-centre over the content so the comparison is
  // deterministic rather than a coin-flip on where the animation happens
  // to be when the shutter opens.
  const freeze = `.b4-refraction-sweep__layer--moving .b4-refraction-sweep__band {
    animation: none !important;
    transform: translateX(30%) !important;
  }`;

  await page.goto("/iframe.html?id=effects-refractionsweep--default");
  await page.addStyleTag({ content: freeze });
  await page.waitForTimeout(200);
  const withWave = await page.locator(".b4-refraction-sweep").first().screenshot();

  await page.goto("/iframe.html?id=effects-refractionsweep--inactive");
  await page.waitForTimeout(200);
  const withoutWave = await page.locator(".b4-refraction-sweep").first().screenshot();

  expect(Buffer.compare(withWave, withoutWave)).not.toBe(0);
});

test("RefractionSweep applies a real backdrop refraction to the band, not just a painted overlay", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-refractionsweep--default");

  const backdropFilter = await page
    .locator(".b4-refraction-sweep__band")
    .first()
    .evaluate((el) => getComputedStyle(el).backdropFilter);

  expect(backdropFilter).toContain("blur");
});

test("RefractionSweep's wave layer never intercepts pointer events — clicking through it still works", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-refractionsweep--default");

  const pointerEvents = await page
    .locator(".b4-refraction-sweep__layer")
    .first()
    .evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(pointerEvents).toBe("none");
});

test("RefractionSweep renders no wave layer at all when inactive", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-refractionsweep--inactive");
  await expect(page.locator(".b4-refraction-sweep__layer")).toHaveCount(0);
});

test("RefractionSweep holds still under reduced motion — the band stops travelling", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=effects-refractionsweep--default");

  const band = page.locator(".b4-refraction-sweep__band").first();
  const transform1 = await band.evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(800);
  const transform2 = await band.evaluate((el) => getComputedStyle(el).transform);

  expect(transform1).toBe(transform2);
});

test("RefractionSweep never blurs the content when it is not travelling — reduced motion drops the refraction entirely", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=effects-refractionsweep--default");

  const backdropFilter = await page
    .locator(".b4-refraction-sweep__band")
    .first()
    .evaluate((el) => getComputedStyle(el).backdropFilter);

  expect(backdropFilter).toBe("none");
});

test("RefractionSweep causes no layout shift — the wrapper's box exactly matches its child, despite the absolutely-positioned wave layer", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=effects-refractionsweep--default");

  const wrapperBox = await page.locator(".b4-refraction-sweep").first().boundingBox();
  const childBox = await page.locator(".b4-refraction-sweep > .b4-card").first().boundingBox();

  expect(wrapperBox?.width).toBe(childBox?.width);
  expect(wrapperBox?.height).toBe(childBox?.height);
});

test("RefractionSweep clips the wave to the wrapper — the layer never lets the band spill outside the surface", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=effects-refractionsweep--default");

  const overflow = await page
    .locator(".b4-refraction-sweep__layer")
    .first()
    .evaluate((el) => getComputedStyle(el).overflow);
  expect(overflow).toBe("hidden");
});
