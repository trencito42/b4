import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region", "aria-hidden-focus"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Popover is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-popover--default&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: "Settings" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Popover opens on click, closes on Escape, and returns focus to the trigger", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-popover--default");

  const trigger = page.getByRole("button", { name: "Settings" });
  await trigger.click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Deploy settings")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await expect(trigger).toBeFocused();
});

test("Popover holds real interactive content, not a static mockup", async ({ page }) => {
  await page.goto(
    "/iframe.html?id=family-c-navigation-overlays-popover--with-interactive-content",
  );

  await page.getByRole("button", { name: "Delete" }).click();
  const confirmButton = page.getByRole("button", { name: "Delete permanently" });
  await expect(confirmButton).toBeVisible();
  await confirmButton.click();
});

test("Popover closes on an outside click", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-popover--default");

  await page.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();

  await page.mouse.click(10, 10);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});
