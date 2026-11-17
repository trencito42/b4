import { test, expect } from "@playwright/test";

test("explicit reduced motion disables CSS transitions without OS reduced motion", async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.goto(
    "/iframe.html?id=family-b-forms-inputs-combobox--default&globals=b4Motion:reduced",
  );
  const control = page.locator(".b4-combobox");
  await expect(control).toBeVisible();
  await expect(control).toHaveCSS("transition-duration", "0s");
  await expect(page.locator("html")).toHaveAttribute("data-b4-motion", "reduced");
});

test("explicit full motion restores CSS transitions", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(
    "/iframe.html?id=family-b-forms-inputs-combobox--default&globals=b4Motion:full",
  );
  const control = page.locator(".b4-combobox");
  await expect(control).toBeVisible();
  await expect(control).not.toHaveCSS("transition-duration", "0s");
  await expect(page.locator("html")).toHaveAttribute("data-b4-motion", "full");
});
