import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  for (const width of [320, 390, 768, 1440, 1920]) {
    test(`Slider centers handles without overlapping labels at ${width}px on ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(
        `/iframe.html?id=family-b-forms-inputs-slider--long-label&globals=b4Theme:${theme}`,
      );
      await expect(page.getByRole("slider").first()).toBeVisible();
      const geometry = await page.evaluate(() => {
        const header = document
          .querySelector(".b4-slider-field__header")!
          .getBoundingClientRect();
        const track = document
          .querySelector(".b4-slider__track")!
          .getBoundingClientRect();
        const thumbs = [...document.querySelectorAll(".b4-slider__thumb")].map((el) =>
          el.getBoundingClientRect(),
        );
        return {
          overflow: document.documentElement.scrollWidth > innerWidth,
          clearOfLabel: thumbs.every((rect) => rect.top > header.bottom),
          centerError: Math.max(
            ...thumbs.map((rect) =>
              Math.abs(rect.y + rect.height / 2 - track.y - track.height / 2),
            ),
          ),
        };
      });
      expect(geometry.overflow).toBe(false);
      expect(geometry.clearOfLabel).toBe(true);
      expect(geometry.centerError).toBeLessThan(1);
    });
  }
  test(`Slider range story is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-slider--range&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("slider").first()).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Slider responds to arrow keys in a real browser", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-slider--default");

  const thumb = page.getByRole("slider", { name: "Volume" });
  await thumb.focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");

  await expect(thumb).toHaveAttribute("aria-valuenow", "42");
});

test("Slider keyboard focus lands on the native input, not a second Motion tab stop", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-slider--default");
  await expect(page.getByRole("slider")).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("slider")).toBeFocused();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("slider")).toHaveAttribute("aria-valuenow", "41");
  await expect(page.locator(".b4-slider__thumb")).toHaveCSS("outline-style", "solid");
});
