import { test, expect, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;
const base = "family-b-forms-inputs-tagsinput";
const control = ".b4-tags-input__control";
const chip = ".b4-tags-input__tag-label";

function chips(page: Page) {
  return page.locator(chip);
}

for (const theme of themes) {
  test(`TagsInput is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${base}--all-sizes&globals=b4Theme:${theme}`);
    await expect(page.locator("#storybook-root")).not.toBeEmpty();
    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`TagsInput chip text meets contrast on ${theme}`, async ({ page }) => {
    // The chip surface is one step off the field's own background; both
    // themes have to clear contrast, not just the dark one.
    await page.goto(`/iframe.html?id=${base}--long-tags-wrap&globals=b4Theme:${theme}`);
    await expect(chips(page).first()).toBeVisible();
    const results = await new AxeBuilder({ page })
      .disableRules(isolatedRules)
      .include(control)
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Enter commits a tag and clears the draft", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--empty`);
  const input = page.getByLabel("Topics");
  await input.fill("design");
  await input.press("Enter");

  await expect(chips(page)).toHaveText(["design"]);
  await expect(input).toHaveValue("");
});

test("typing a comma commits the tag", async ({ page }) => {
  // Worth a real-browser test: a unit test drives keydown directly, while
  // here the comma goes through actual key handling and default prevention
  // — the character must commit a tag, not land in the draft.
  await page.goto(`/iframe.html?id=${base}--empty`);
  const input = page.getByLabel("Topics");
  await input.pressSequentially("css,");

  await expect(chips(page)).toHaveText(["css"]);
  await expect(input).toHaveValue("");
});

test("Backspace on an empty draft removes the last tag", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  await page.getByLabel("Topics").click();
  await page.keyboard.press("Backspace");

  await expect(chips(page)).toHaveText(["design-system"]);
});

test("the remove button deletes only its own tag", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  await page.getByRole("button", { name: "Remove design-system" }).click();

  await expect(chips(page)).toHaveText(["react"]);
});

test("ArrowLeft steps from the draft into the chips and Backspace removes the focused one", async ({
  page,
}) => {
  await page.goto(`/iframe.html?id=${base}--default`);
  await page.getByLabel("Topics").click();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByRole("button", { name: "Remove react" })).toBeFocused();

  await page.keyboard.press("Backspace");
  await expect(chips(page)).toHaveText(["design-system"]);
});

test("the control grows downward instead of overflowing when tags wrap", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--long-tags-wrap`);
  const box = await page.locator(control).boundingBox();
  expect(box!.height).toBeGreaterThan(40);

  // Nothing may spill out of the field horizontally.
  const overflow = await page.locator(control).evaluate((el) => {
    const parent = el.getBoundingClientRect();
    return [...el.querySelectorAll(".b4-tags-input__tag")].some(
      (tag) => tag.getBoundingClientRect().right > parent.right + 1,
    );
  });
  expect(overflow).toBe(false);
});

test("a wrapped control keeps rounded-rectangle corners, not a stadium", async ({ page }) => {
  // Regression guard for the same geometry defect found on InputOTP's
  // slots: --b4-control-radius is a 999px pill, which on a multi-row box
  // bends the ends into a stadium that crowds the chips.
  await page.goto(`/iframe.html?id=${base}--long-tags-wrap`);
  const { radius, height } = await page.locator(control).evaluate((el) => ({
    radius: parseFloat(getComputedStyle(el).borderTopLeftRadius),
    height: el.getBoundingClientRect().height,
  }));
  expect(radius).toBeLessThan(height / 2);
});

test("readOnly shows the tags but offers no remove buttons", async ({ page }) => {
  await page.goto(`/iframe.html?id=${base}--read-only`);
  await expect(chips(page)).toHaveText(["locked", "immutable"]);
  await expect(page.getByRole("button", { name: /^Remove / })).toHaveCount(0);
});

test("the draft input sits at the shared control height when a single row", async ({ page }) => {
  // Coherence check: a one-row TagsInput must line up with TextField, not
  // invent its own height.
  await page.goto(`/iframe.html?id=${base}--default`);
  const { height, token } = await page.locator(control).evaluate((el) => ({
    height: el.getBoundingClientRect().height,
    token: getComputedStyle(document.documentElement).getPropertyValue("--b4-control-height").trim(),
  }));
  expect(height).toBe(parseFloat(token));
});
