import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("TextMorph Component", () => {
  test("Word replacement story updates text and maintains accessible markup without axe violations", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=family-e-feedback-motion-textmorph--word-replacement",
    );

    const morphRoot = page.locator(".b4-text-morph");
    await expect(morphRoot).toBeVisible();

    const srOnly = page.locator(".b4-text-morph__sr-only");
    await expect(srOnly).toHaveText("Write report");

    // Click next status: "Write report" -> "Review report"
    const nextBtn = page.getByRole("button", { name: "Next status" });
    await nextBtn.click();
    await expect(srOnly).toHaveText("Review report");

    // Next: "Sign report"
    await nextBtn.click();
    await expect(srOnly).toHaveText("Sign report");

    // Next: "Archive report"
    await nextBtn.click();
    await expect(srOnly).toHaveText("Archive report");

    // Axe audit
    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test("Word reordering swaps surviving tokens smoothly", async ({ page }) => {
    await page.goto(
      "/iframe.html?id=family-e-feedback-motion-textmorph--word-reordering",
    );

    const srOnly = page.locator(".b4-text-morph__sr-only");
    await expect(srOnly).toHaveText("cat and dog");

    const swapBtn = page.getByRole("button", { name: "Swap words" });
    await swapBtn.click();
    await expect(srOnly).toHaveText("dog and cat");

    await swapBtn.click();
    await expect(srOnly).toHaveText("cat and dog");
  });

  test("Numeric counters handle place values and rapid updates", async ({ page }) => {
    await page.goto(
      "/iframe.html?id=family-e-feedback-motion-textmorph--numeric-counters",
    );

    const srOnly = page.locator(".b4-text-morph__sr-only");
    await expect(srOnly).toHaveText("$98,204");

    const plusOne = page.getByRole("button", { name: "+ 1", exact: true });
    await plusOne.click();
    await expect(srOnly).toHaveText("$99,204");

    const plusTen = page.getByRole("button", { name: "+ 10", exact: true });
    await plusTen.click();
    await expect(srOnly).toHaveText("$109,204");

    const minusOne = page.getByRole("button", { name: "- 1", exact: true });
    await minusOne.click();
    await expect(srOnly).toHaveText("$108,204");
  });

  test("Multilingual diacritics preserve Romanian grapheme clusters", async ({ page }) => {
    await page.goto(
      "/iframe.html?id=family-e-feedback-motion-textmorph--multilingual-diacritics",
    );

    const srOnly = page.locator(".b4-text-morph__sr-only");
    await expect(srOnly).toHaveText("Bună dimineața!");

    const cycleBtn = page.getByRole("button", { name: "Schimbă salutul" });
    await cycleBtn.click();
    await expect(srOnly).toHaveText("Bună ziua!");

    await cycleBtn.click();
    await expect(srOnly).toHaveText("Bună seara!");
  });
});
