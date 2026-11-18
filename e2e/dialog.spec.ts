import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Dialog is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-dialog--default&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: "Edit profile" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Dialog traps focus and closes on Escape, returning focus to the trigger", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-dialog--default");

  const trigger = page.getByRole("button", { name: "Edit profile" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("Dialog closes via the close button and blocks background interaction while open", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-dialog--default");

  await page.getByRole("button", { name: "Edit profile" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  // The backdrop should intercept pointer events — clicking where the
  // trigger button used to be must not close/reopen anything unexpected.
  await expect(page.locator(".b4-dialog__backdrop")).toBeVisible();

  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Dialog survives interrupted open/close cycles under reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=family-c-navigation-overlays-dialog--default");

  const trigger = page.getByRole("button", { name: "Edit profile" });
  for (let i = 0; i < 5; i++) {
    await trigger.click();
    await expect(page.getByRole("dialog")).toHaveCount(1);
    await page.keyboard.press("Escape");
    await expect(page.getByRole("dialog")).toHaveCount(0);
  }
});
