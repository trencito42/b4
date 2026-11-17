import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Checkbox is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-checkbox--checked&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("checkbox")).toBeChecked();

    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`Switch is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-switch--on&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("switch")).toBeChecked();

    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });

  test(`RadioGroup is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-radiogroup--default&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("radio", { name: "Pro" })).toBeChecked();

    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

for (const theme of themes) {
  test(`TextField (with error) is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-textfield--with-error&globals=b4Theme:${theme}`,
    );
    await expect(page.getByText("Enter a valid email address.")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("TextField accepts typed input in a real browser", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-textfield--default");

  const input = page.getByRole("textbox", { name: "Email address" });
  await input.fill("hi@example.com");
  await expect(input).toHaveValue("hi@example.com");
});

test("RadioGroup supports arrow-key navigation in a real browser", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-radiogroup--default");

  await page.getByRole("radio", { name: "Pro" }).focus();
  await page.keyboard.press("ArrowDown");

  await expect(page.getByRole("radio", { name: "Enterprise" })).toBeFocused();
  await expect(page.getByRole("radio", { name: "Enterprise" })).toBeChecked();
});
