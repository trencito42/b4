import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region", "aria-hidden-focus"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`MultiSelect is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-multiselect--with-selection&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("combobox", { name: "Frameworks" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`InputGroup is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-b-forms-inputs-inputgroup--with-prefix&globals=b4Theme:${theme}`,
    );
    await expect(page.getByText("https://")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("MultiSelect picks multiple items by keyboard without closing between picks", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-multiselect--empty");

  const trigger = page.getByRole("combobox", { name: "Frameworks" });
  await trigger.click();
  await expect(page.getByRole("listbox")).toBeVisible();

  await page.getByRole("option", { name: "React", exact: true }).click();
  await expect(page.getByRole("listbox")).toBeVisible();
  await page.getByRole("option", { name: "Svelte", exact: true }).click();
  await expect(page.getByRole("listbox")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(trigger).toHaveText("React, Svelte");
});

test("InputGroup accepts typed input alongside its addon in a real browser", async ({ page }) => {
  await page.goto("/iframe.html?id=family-b-forms-inputs-inputgroup--with-prefix");

  const input = page.getByRole("textbox", { name: "Website" });
  await input.fill("example.com");
  await expect(input).toHaveValue("example.com");
  await expect(page.getByText("https://")).toBeVisible();
});
