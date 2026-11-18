import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`MorphingSurface is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-e-feedback-motion-morphingsurface--expand-in-place&globals=b4Theme:${theme}`,
    );
    await expect(page.getByTestId("morph-surface")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("MorphingSurface really changes width when expanded, not just text", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-morphingsurface--expand-in-place");

  const surface = page.getByTestId("morph-surface");
  const before = (await surface.boundingBox())!;
  await surface.click();
  await page.waitForTimeout(400); // let the real layout-projection animation settle
  const after = (await surface.boundingBox())!;

  expect(after.width).toBeGreaterThan(before.width);
});

test("MorphingSurface keeps exactly one element mounted as a shared layoutId moves between two mount points", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-morphingsurface--shared-layout-id");

  await expect(page.getByTestId("morph-surface")).toHaveCount(1);
  await expect(page.getByText("List item — click")).toBeVisible();

  await page.getByTestId("morph-surface").click();

  await expect(page.getByTestId("morph-surface")).toHaveCount(1);
  await expect(page.getByText("Expanded detail")).toBeVisible();
});
