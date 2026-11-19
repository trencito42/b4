import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`ResizablePanels is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=family-f-application-patterns-resizablepanels--horizontal&globals=b4Theme:${theme}`);
    await expect(page.getByRole("separator")).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("ResizablePanels resizes with a real pointer drag", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-resizablepanels--horizontal");

  const separator = page.getByRole("separator");
  await expect(separator).toHaveAttribute("aria-valuenow", "50");

  const box = (await separator.boundingBox())!;
  await page.mouse.move(box.x + box.width / 2, box.y + box.height / 2);
  await page.mouse.down();
  await page.mouse.move(box.x + 200, box.y + box.height / 2);
  await page.mouse.up();

  const valueNow = Number(await separator.getAttribute("aria-valuenow"));
  expect(valueNow).toBeGreaterThan(55);
});

test("ResizablePanels resizes with real arrow-key presses once focused", async ({ page }) => {
  await page.goto("/iframe.html?id=family-f-application-patterns-resizablepanels--horizontal");

  const separator = page.getByRole("separator");
  await separator.focus();
  await expect(separator).toHaveAttribute("aria-valuenow", "50");

  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await expect(separator).toHaveAttribute("aria-valuenow", "54");

  await page.keyboard.press("Home");
  await expect(separator).toHaveAttribute("aria-valuenow", "10");

  await page.keyboard.press("End");
  await expect(separator).toHaveAttribute("aria-valuenow", "90");
});
