import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`TimePicker is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-b-inputs-forms-timepicker--default&globals=b4Theme:${theme}`);
    await expect(page.getByRole("textbox", { name: "Hours" })).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("TimePicker shows the hour/minute/AM-PM for the current value", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-timepicker--default");

  await expect(page.getByRole("textbox", { name: "Hours" })).toHaveValue("02");
  await expect(page.getByRole("textbox", { name: "Minutes" })).toHaveValue("30");
  await expect(page.getByRole("button", { name: "PM" })).toHaveAttribute("aria-pressed", "true");
});

test("TimePicker steps hours/minutes with the stepper buttons", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-timepicker--default");

  await page.getByRole("button", { name: "Increase minutes" }).click();
  await expect(page.getByRole("textbox", { name: "Minutes" })).toHaveValue("31");

  await page.getByRole("button", { name: "Decrease hours" }).click();
  await expect(page.getByRole("textbox", { name: "Hours" })).toHaveValue("01");
});

test("TimePicker switches AM/PM", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-timepicker--default");

  await expect(page.getByRole("button", { name: "PM" })).toHaveAttribute("aria-pressed", "true");
  await page.getByRole("button", { name: "AM" }).click();
  await expect(page.getByRole("button", { name: "AM" })).toHaveAttribute("aria-pressed", "true");
  await expect(page.getByRole("button", { name: "PM" })).toHaveAttribute("aria-pressed", "false");
});

test("TimePicker's 24-hour story has no AM/PM control and shows raw 24-hour values", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-timepicker--twenty-four-hour");

  await expect(page.getByRole("textbox", { name: "Hours" })).toHaveValue("14");
  await expect(page.getByRole("button", { name: "AM" })).toHaveCount(0);
});

test("TimePicker supports keyboard arrow-key stepping on the hour/minute inputs", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-inputs-forms-timepicker--default");

  const minutes = page.getByRole("textbox", { name: "Minutes" });
  await minutes.focus();
  await page.keyboard.press("ArrowUp");
  await expect(minutes).toHaveValue("31");
  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(minutes).toHaveValue("29");
});
