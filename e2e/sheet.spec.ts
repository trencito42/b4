import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Sheet is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-c-navigation-overlays-sheet--default&globals=b4Theme:${theme}`);
    await page.getByRole("button", { name: "Open sheet" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Sheet opens on trigger click and closes on Escape", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-sheet--default");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open sheet" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Filters")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Sheet closes via the close button and via a backdrop click", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-sheet--default");

  await page.getByRole("button", { name: "Open sheet" }).click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Open sheet" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Sheet supports real drag-to-dismiss toward its bottom edge", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-sheet--default");

  await page.getByRole("button", { name: "Open sheet" }).click();
  const popup = page.getByRole("dialog");
  await expect(popup).toBeVisible();

  const box = (await popup.boundingBox())!;
  const startX = box.x + box.width / 2;
  const startY = box.y + 20;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  await page.mouse.move(startX, startY + box.height * 0.8, { steps: 10 });
  await page.mouse.up();

  await expect(popup).toHaveCount(0);
});
