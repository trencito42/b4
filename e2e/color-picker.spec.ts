import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`ColorPicker is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-b-inputs-forms-colorpicker--default&globals=b4Theme:${theme}`);
    await page.getByRole("button", { name: "#3366cc" }).click();
    await expect(page.getByRole("slider", { name: "Hue" })).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ColorPicker opens the panel with the area, hue slider, and hex field", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-colorpicker--default");

  await expect(page.getByRole("slider", { name: "Hue" })).toHaveCount(0);
  await page.getByRole("button", { name: "#3366cc" }).click();
  await expect(page.getByRole("slider", { name: "Saturation and brightness" })).toBeVisible();
  await expect(page.getByRole("slider", { name: "Hue" })).toBeVisible();
  await expect(page.getByRole("textbox", { name: "Hex color" })).toHaveValue("#3366cc");
});

test("ColorPicker updates the swatch and trigger when a hex value is typed", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-colorpicker--default");

  await page.getByRole("button", { name: "#3366cc" }).click();
  const hexInput = page.getByRole("textbox", { name: "Hex color" });
  await hexInput.fill("#ff0000");

  await expect(page.getByRole("button", { name: "#ff0000" })).toBeVisible();
});

test("ColorPicker supports a real pointer drag on the saturation/brightness area", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-colorpicker--default");

  await page.getByRole("button", { name: "#3366cc" }).click();
  const area = page.getByRole("slider", { name: "Saturation and brightness" }).locator("..");
  const box = (await area.boundingBox())!;

  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + box.width * 0.9, box.y + box.height * 0.1, { steps: 5 });
  await page.mouse.up();

  const slider = page.getByRole("slider", { name: "Saturation and brightness" });
  const valueText = await slider.getAttribute("aria-valuetext");
  expect(valueText).toMatch(/Saturation 8\d%|Saturation 9\d%/);
});

test("ColorPicker supports a real pointer drag on the hue slider", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-colorpicker--default");

  await page.getByRole("button", { name: "#3366cc" }).click();
  const hueTrack = page.locator(".b4-color-picker__hue-track");
  const box = (await hueTrack.boundingBox())!;

  await page.mouse.click(box.x + box.width * 0.9, box.y + box.height / 2);

  const hueSlider = page.getByRole("slider", { name: "Hue" });
  const valueNow = await hueSlider.getAttribute("aria-valuenow");
  expect(Number(valueNow)).toBeGreaterThan(300);
});

test("ColorPicker nudges saturation/brightness with arrow keys", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-colorpicker--default");

  await page.getByRole("button", { name: "#3366cc" }).click();
  const area = page.getByRole("slider", { name: "Saturation and brightness" });
  await area.focus();
  const before = await area.getAttribute("aria-valuetext");
  await page.keyboard.press("ArrowRight");
  const after = await area.getAttribute("aria-valuetext");

  expect(after).not.toBe(before);
});
