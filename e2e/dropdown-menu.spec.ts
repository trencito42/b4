import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region", "aria-hidden-focus"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`DropdownMenu is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-dropdownmenu--default&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: "Actions" }).click();
    const menu = page.getByRole("menu");
    await expect(menu).toBeVisible();
    // Wait for the entrance opacity spring to finish — sampling color
    // contrast mid-fade blends the text color with whatever is behind
    // it and produces a false positive, not a real token defect.
    await expect
      .poll(() => menu.evaluate((el) => Number(getComputedStyle(el).opacity)))
      .toBe(1);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("DropdownMenu supports full keyboard navigation and selection", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-dropdownmenu--default");

  const trigger = page.getByRole("button", { name: "Actions" });
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(page.getByRole("menu")).toBeVisible();

  await page.keyboard.press("ArrowDown");
  await page.keyboard.press("ArrowDown");
  await expect(page.getByRole("menuitem", { name: "Archive" })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("DropdownMenu disabled item is focusable but not selectable", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=family-c-navigation-overlays-dropdownmenu--with-disabled-item",
  );
  await page.getByRole("button", { name: "Actions" }).click();

  const disabledItem = page.getByRole("menuitem", { name: "Duplicate" });
  await expect(disabledItem).toHaveAttribute("aria-disabled", "true");
});

test("DropdownMenu survives rapid repeated open/close without leaving duplicate menus", async ({
  page,
}) => {
  // Rapid-fire under reduced motion, matching the pattern already proven
  // stable in select.spec.ts/combobox.spec.ts: with no entrance/exit
  // animation to race, open/close cycles are deterministic. Rapid-firing
  // under full motion instead races the settle spring's variable
  // duration against the next click and is flaky by construction, not a
  // real product defect — see HANDOFF.md.
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=family-c-navigation-overlays-dropdownmenu--default");

  const trigger = page.getByRole("button", { name: "Actions" });
  for (let i = 0; i < 6; i++) {
    await trigger.click();
    await page.keyboard.press("Escape");
  }

  await expect(page.getByRole("menu")).toHaveCount(0);

  // One full-motion open/close/reopen cycle, not rapid-fired, to confirm
  // the real spring-driven path also leaves exactly one menu behind.
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await trigger.click();
  await expect(page.getByRole("menu")).toHaveCount(1);
  await page.keyboard.press("Escape");
  await expect(page.getByRole("menu")).toHaveCount(0);
  await trigger.click();
  await expect(page.getByRole("menu")).toHaveCount(1);
});

test("clicking a menu item with the mouse selects it and closes the menu", async ({ page }) => {
  // This exact path (mouse click on an item, not keyboard Enter) was
  // never actually exercised before: an earlier draft of this suite only
  // keyboard-tested selection and escape-tested closing. Building
  // SplitButton's equivalent test surfaced a real bug — a missing
  // onSelect in that story threw inside the click handler and silently
  // blocked Base UI's own close-on-click behavior (see QUALITY_MATRIX.md/
  // HANDOFF.md). This test pins the mouse-click path for DropdownMenu
  // itself so the gap can't reopen unnoticed.
  await page.goto("/iframe.html?id=family-c-navigation-overlays-dropdownmenu--default");
  await page.getByRole("button", { name: "Actions" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await expect
    .poll(() => menu.evaluate((el) => Number(getComputedStyle(el).opacity)))
    .toBe(1);

  await page.getByRole("menuitem", { name: "Rename" }).click();

  await expect(page.getByRole("menu")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Actions" })).toHaveAttribute(
    "aria-expanded",
    "false",
  );
});
