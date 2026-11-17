import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const story = (name = "default", theme = "graphite") =>
  `/iframe.html?id=family-b-forms-inputs-select--${name}&globals=b4Theme:${theme}`;
const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];

for (const theme of ["graphite", "porcelain"]) {
  for (const width of [320, 390, 768, 1440, 1920]) {
    test(`Select wraps and stays in viewport at ${width}px on ${theme}`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 800 });
      await page.goto(story("long-collection", theme));
      await page.getByRole("combobox").click();
      const popup = page.locator(".b4-select__popup");
      await expect(popup).toBeVisible();
      await expect(page.getByRole("option").first()).toContainText("Workspace 1");
      // Wait for the entrance spring before inspecting its final geometry.
      await expect
        .poll(() => popup.evaluate((el) => Number(getComputedStyle(el).opacity)))
        .toBe(1);
      const bounds = await popup.boundingBox();
      expect(bounds).not.toBeNull();
      expect(bounds!.x).toBeGreaterThanOrEqual(0);
      expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(width);
      expect(bounds!.y + bounds!.height).toBeLessThanOrEqual(800);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
      ).toBe(true);
      expect(
        (await new AxeBuilder({ page }).disableRules(isolatedRules).analyze()).violations,
      ).toEqual([]);
      await page.screenshot({
        path: test.info().outputPath(`select-${theme}-${width}.png`),
      });
    });
  }

  test(`Select keyboard selection, disabled item and restored focus on ${theme}`, async ({
    page,
  }) => {
    await page.goto(story("with-hint", theme));
    const trigger = page.getByRole("combobox", { name: "Publication status" });
    await trigger.focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("option", { name: /In review/ })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    await page.keyboard.press("End");
    await page.keyboard.press("Enter");
    await expect(trigger).toContainText("Archived");
    await expect(page.getByRole("listbox")).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await trigger.press("Enter");
    await page.keyboard.press("Escape");
    await expect(trigger).toBeFocused();
    await expect(page.getByRole("listbox")).toHaveCount(0);
  });
}

test("Select flips above a bottom-edge trigger and scrolls to the last option", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 640 });
  await page.goto(story("near-viewport-edge"));
  await page.getByRole("combobox").click();
  await expect(page.locator(".b4-select__positioner")).toHaveAttribute(
    "data-side",
    "top",
  );
  await page.keyboard.press("End");
  await expect(page.getByRole("option").last()).toBeInViewport();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("combobox")).toContainText("Collection item 40");
});

test("Select survives interrupted exits and honors reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(story());
  const trigger = page.getByRole("combobox");
  for (let index = 0; index < 5; index++) {
    await trigger.press("Enter");
    await expect(page.getByRole("listbox")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("listbox")).toHaveCount(0);
  }
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await trigger.press("Enter");
  await page.keyboard.press("Escape");
  await trigger.press("Enter");
  await expect(page.getByRole("listbox")).toHaveCount(1);
  await expect(page.locator(".b4-select__popup")).toHaveCount(1);
  await expect(page.getByRole("option").last()).toBeVisible();
});
