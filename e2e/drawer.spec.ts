import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Drawer is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-c-navigation-overlays-drawer--default&globals=b4Theme:${theme}`);
    await page.getByRole("button", { name: "Open drawer" }).click();
    await expect(page.getByRole("dialog")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });

  test(`Drawer keeps all of its content inside a 390px viewport on ${theme}`, async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(`/iframe.html?id=family-c-navigation-overlays-drawer--default&globals=b4Theme:${theme};b4Motion:reduced`);
    await page.getByRole("button", { name: "Open drawer" }).click();
    const drawer = page.getByRole("dialog");
    await expect.poll(() => drawer.evaluate((element) => {
      const { left, right, top, bottom } = element.getBoundingClientRect();
      return [left, top, right, bottom];
    })).toEqual([0, 0, 390, 844]);
  });
}

test("Drawer opens on trigger click and closes on Escape", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-drawer--default");

  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Open drawer" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await expect(page.getByText("Edit profile")).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Drawer closes via the close button and via a backdrop click", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-drawer--default");

  await page.getByRole("button", { name: "Open drawer" }).click();
  await page.getByRole("button", { name: "Close" }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);

  await page.getByRole("button", { name: "Open drawer" }).click();
  await expect(page.getByRole("dialog")).toBeVisible();
  await page.mouse.click(10, 10);
  await expect(page.getByRole("dialog")).toHaveCount(0);
});

test("Drawer supports real drag-to-dismiss toward its swipe edge", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-drawer--default");

  await page.getByRole("button", { name: "Open drawer" }).click();
  const popup = page.getByRole("dialog");
  await expect(popup).toBeVisible();

  const box = (await popup.boundingBox())!;
  const startX = box.x + box.width / 2;
  const startY = box.y + 40;

  await page.mouse.move(startX, startY);
  await page.mouse.down();
  // Drag toward the right edge (this drawer's swipe-to-dismiss direction),
  // past the distance the primitive treats as a confirmed dismiss.
  await page.mouse.move(startX + box.width * 0.8, startY, { steps: 10 });
  await page.mouse.up();

  await expect(popup).toHaveCount(0);
});
