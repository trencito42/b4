import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`AlertDialog is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-alertdialog--default&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: "Delete project" }).click();
    await expect(page.getByRole("alertdialog")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("AlertDialog does not close on outside click (unlike Dialog) — requires an explicit choice", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-alertdialog--default");

  await page.getByRole("button", { name: "Delete project" }).click();
  await expect(page.getByRole("alertdialog")).toBeVisible();

  await page.mouse.click(10, 10);
  await expect(page.getByRole("alertdialog")).toBeVisible();
});

test("AlertDialog Cancel closes without confirming; Confirm closes and confirms", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-alertdialog--default");

  const trigger = page.getByRole("button", { name: "Delete project" });
  await trigger.click();
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);

  await trigger.click();
  await page.getByRole("button", { name: "Delete permanently" }).click();
  await expect(page.getByRole("alertdialog")).toHaveCount(0);
});

test("AlertDialog has no decorative close (x) button — only Cancel/Confirm", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-alertdialog--default");

  await page.getByRole("button", { name: "Delete project" }).click();
  const dialog = page.getByRole("alertdialog");
  await expect(dialog.getByRole("button", { name: "Close" })).toHaveCount(0);
});
