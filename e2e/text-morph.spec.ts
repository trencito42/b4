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

    // The outgoing glyph is decorative and fades through intermediate colors.
    // Audit the stable, readable label after the real animation removes it.
    await expect(morphRoot.locator(".b4-text-morph__exiting-token")).toHaveCount(0);
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

  test("word replacement keeps the new phrase on one line through resizing", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=family-e-feedback-motion-textmorph--word-replacement&globals=b4Motion:full",
    );

    const frames = await page
      .getByRole("button", { name: "Next status" })
      .evaluate(async (button) => {
        button.click();
        const samples = [];
        const until = performance.now() + 650;
        while (performance.now() < until) {
          await new Promise(requestAnimationFrame);
          const words = [
            ...document.querySelectorAll<HTMLElement>(
              ".b4-text-morph__token:not(.b4-text-morph__token--space)",
            ),
          ];
          if (words[0]?.textContent !== "Review" || !words[1]) continue;
          samples.push({
            wraps: words[0].offsetTop !== words[1].offsetTop,
            moving:
              Math.abs(new DOMMatrixReadOnly(getComputedStyle(words[1]).transform).m41) >
              0.25,
            hasExit: Boolean(document.querySelector(".b4-text-morph__exiting-token")),
          });
        }
        return samples;
      });

    expect(frames.some(({ wraps }) => wraps)).toBe(false);
    expect(frames.some(({ moving, hasExit }) => moving && !hasExit)).toBe(true);
    await expect(page.locator(".b4-text-morph__exiting-token")).toHaveCount(0);
  });

  test("words that exchange places pass on opposite sides of the line", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=family-e-feedback-motion-textmorph--word-reordering&globals=b4Motion:full",
    );

    const samples = await page
      .getByRole("button", { name: "Swap words" })
      .evaluate(async (button) => {
        button.click();
        const frames = [];
        const until = performance.now() + 650;
        while (performance.now() < until) {
          await new Promise(requestAnimationFrame);
          const words = [...document.querySelectorAll(".b4-text-morph__token")];
          const cat = words
            .find((word) => word.textContent === "cat")
            ?.getBoundingClientRect();
          const dog = words
            .find((word) => word.textContent === "dog")
            ?.getBoundingClientRect();
          if (cat && dog) {
            frames.push({
              horizontal: Math.abs(cat.left + cat.width / 2 - dog.left - dog.width / 2),
              vertical: Math.abs(cat.top - dog.top) / cat.height,
            });
          }
        }
        return frames;
      });

    const crossing = samples.reduce((closest, frame) =>
      frame.horizontal < closest.horizontal ? frame : closest,
    );
    expect(crossing.horizontal).toBeLessThan(16);
    expect(crossing.vertical).toBeGreaterThan(0.95);
  });

  test("character morph settles to the latest value after rapid interruptions", async ({
    page,
  }) => {
    await page.goto(
      "/iframe.html?id=family-e-feedback-motion-textmorph--character-morph&globals=b4Motion:full",
    );
    const button = page.getByRole("button", { name: "Cycle state" });
    await button.evaluate(async (element) => {
      for (let i = 0; i < 3; i++) {
        element.click();
        await new Promise(requestAnimationFrame);
        await new Promise(requestAnimationFrame);
      }
    });

    const root = page.locator(".b4-text-morph");
    await expect(root.locator(".b4-text-morph__sr-only")).toHaveText("Saved!");
    await expect(root.locator(".b4-text-morph__exiting-token")).toHaveCount(0);
    await expect
      .poll(() =>
        root.evaluate((element) =>
          [
            ...element.querySelectorAll<HTMLElement>(
              ".b4-text-morph__sizer, .b4-text-morph__flow, .b4-text-morph__token",
            ),
          ].every((child) => !child.getAttribute("style")),
        ),
      )
      .toBe(true);
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

  test("Multilingual diacritics preserve Romanian grapheme clusters", async ({
    page,
  }) => {
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
