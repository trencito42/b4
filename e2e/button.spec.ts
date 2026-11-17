import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("Button story renders and is axe-clean in both themes", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=family-a-actions-identity-button--all-variants",
  );
  await expect(page.getByRole("button", { name: "Primary" })).toBeVisible();

  // Storybook's iframe.html is a bare document holding a single component,
  // not a full page — axe's page-structure "best-practice" rules (a single
  // <h1>, a <main> landmark, etc.) don't apply here and would be false
  // positives. Real page structure is checked on the Studio showcase pages
  // instead (see e2e/showcases once Phase 6 lands).
  const results = await new AxeBuilder({ page })
    .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("Button responds to rapid repeated clicks without getting stuck", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=family-a-actions-identity-button--primary",
  );
  const button = page.getByRole("button", { name: "Deploy" });

  for (let i = 0; i < 10; i++) {
    await button.click({ delay: 10 });
  }

  await expect(button).toBeEnabled();
  await expect(button).toBeVisible();
});
