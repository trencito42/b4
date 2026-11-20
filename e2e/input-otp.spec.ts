import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;
const base = "family-b-forms-inputs-inputotp";
const slots = ".b4-input-otp__slot";

for (const theme of themes) {
  test(`InputOTP is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${base}--all-sizes&globals=b4Theme:${theme}`);
    await expect(page.locator("#storybook-root")).not.toBeEmpty();
    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("typing advances through the slots", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  await page.locator(slots).first().click();
  await page.keyboard.type("1234");

  const values = await page.locator(slots).evaluateAll((els) =>
    els.map((el) => (el as HTMLInputElement).value),
  );
  expect(values.slice(0, 4)).toEqual(["1", "2", "3", "4"]);
});

test("pasting a full code fills every slot at once", async ({ page }) => {
  // The behaviour a hand-rolled per-slot implementation breaks first, and
  // the single most common real-world interaction with a code field.
  await page.goto(`/iframe.html?id=${base}--default`);
  const first = page.locator(slots).first();
  await first.click();

  await page.evaluate(async () => {
    const input = document.querySelector(".b4-input-otp__slot") as HTMLInputElement;
    input.focus();
    const data = new DataTransfer();
    data.setData("text/plain", "987654");
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  });

  const values = await page.locator(slots).evaluateAll((els) =>
    els.map((el) => (el as HTMLInputElement).value),
  );
  expect(values.join("")).toBe("987654");
});

test("backspace clears backwards across slot boundaries", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  await page.locator(slots).first().click();
  await page.keyboard.type("12");
  await page.keyboard.press("Backspace");
  await page.keyboard.press("Backspace");

  const values = await page.locator(slots).evaluateAll((els) =>
    els.map((el) => (el as HTMLInputElement).value),
  );
  expect(values.join("")).toBe("");
});

test("numeric mode rejects letters and requests a numeric keyboard", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  const first = page.locator(slots).first();
  await expect(first).toHaveAttribute("inputmode", "numeric");

  await first.click();
  await page.keyboard.type("ab");
  const values = await page.locator(slots).evaluateAll((els) =>
    els.map((el) => (el as HTMLInputElement).value),
  );
  expect(values.join("")).toBe("");
});

test("exposes autocomplete=one-time-code for OS and password-manager autofill", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  await expect(page.locator('[autocomplete="one-time-code"]').first()).toBeAttached();
});

test("slots are equally sized and the visual grouping never splits the value", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--grouped`);
  const items = page.locator(slots);
  await expect(items).toHaveCount(6);

  const rects = await Promise.all((await items.all()).map((s) => s.boundingBox()));
  const widths = rects.map((r) => Math.round(r!.width));
  const heights = rects.map((r) => Math.round(r!.height));
  expect(new Set(widths).size).toBe(1);
  expect(new Set(heights).size).toBe(1);

  // The gap after slot 3 is wider than the gap between slots 1-2.
  const gapWithinGroup = rects[1]!.x - (rects[0]!.x + rects[0]!.width);
  const gapAtGroupEnd = rects[3]!.x - (rects[2]!.x + rects[2]!.width);
  expect(gapAtGroupEnd).toBeGreaterThan(gapWithinGroup);

  // ...and the grouping is purely visual: paste still fills all six.
  await page.evaluate(() => {
    const input = document.querySelector(".b4-input-otp__slot") as HTMLInputElement;
    input.focus();
    const data = new DataTransfer();
    data.setData("text/plain", "135790");
    input.dispatchEvent(new ClipboardEvent("paste", { clipboardData: data, bubbles: true, cancelable: true }));
  });
  const values = await items.evaluateAll((els) => els.map((el) => (el as HTMLInputElement).value));
  expect(values.join("")).toBe("135790");
});

test("a code slot is a rounded box, never an ellipse", async ({ page }) => {
  // Regression guard: --b4-control-radius is `radius-full` (999px) in the
  // default and "round" radius modes, which turned these near-square
  // slots into ovals until the radius was clamped.
  await page.goto(`/iframe.html?id=${base}--default`);
  const first = page.locator(slots).first();
  const { radius, width, height } = await first.evaluate((el) => {
    const cs = getComputedStyle(el);
    const rect = el.getBoundingClientRect();
    return { radius: parseFloat(cs.borderTopLeftRadius), width: rect.width, height: rect.height };
  });
  expect(radius).toBeLessThan(Math.min(width, height) / 2);
});

test("disabled slots cannot be typed into", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--disabled`);
  await expect(page.locator(slots).first()).toBeDisabled();
});
