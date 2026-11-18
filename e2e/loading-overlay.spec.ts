import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`LoadingOverlay is axe-clean when visible on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-e-feedback-motion-loadingoverlay--spinner-only&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("status")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("LoadingOverlay really blocks clicks on the content underneath while visible", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-loadingoverlay--over-content");

  let dialogFired = false;
  page.on("dialog", async (dialog) => {
    dialogFired = true;
    await dialog.dismiss();
  });

  await page.getByRole("button", { name: "Start loading" }).click();
  await expect(page.getByRole("status")).toBeVisible();

  // force:true bypasses Playwright's own actionability check (which would
  // otherwise refuse to click an occluded element) — the point here is to
  // confirm the real browser's hit-testing/pointer-events routes the click
  // to the overlay, not the button underneath.
  await page.getByRole("button", { name: "Click me" }).click({ force: true });
  await page.waitForTimeout(200);

  expect(dialogFired).toBe(false);
});

test("LoadingOverlay lets clicks through again once hidden", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-loadingoverlay--over-content");

  let dialogFired = false;
  page.on("dialog", async (dialog) => {
    dialogFired = true;
    await dialog.dismiss();
  });

  await page.getByRole("button", { name: "Start loading" }).click();
  await expect(page.getByRole("status")).toBeVisible();
  await page.getByRole("button", { name: "Stop loading" }).click();
  await expect(page.getByRole("status")).toHaveCount(0);

  await page.getByRole("button", { name: "Click me" }).click();
  expect(dialogFired).toBe(true);
});
