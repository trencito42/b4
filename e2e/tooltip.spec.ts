import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region", "aria-hidden-focus"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Tooltip is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-tooltip--on-icon-button&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: "Info" }).focus();
    await expect(page.getByText("Delete this project")).toBeVisible();
    // Storybook's own addon-a11y runs a background axe scan on story
    // load; a manually-triggered scan can collide with it ("Axe is
    // already running") if fired too soon after navigation/interaction.
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Tooltip appears on hover and disappears when the mouse leaves", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-tooltip--on-icon-button");

  const trigger = page.getByRole("button", { name: "Info" });
  await trigger.hover();
  await expect(page.getByText("Delete this project")).toBeVisible();

  await page.mouse.move(0, 0);
  await expect(page.getByText("Delete this project")).toHaveCount(0);
});

test("Tooltip appears on keyboard focus, not only mouse hover", async ({ page }) => {
  // Uses the icon-button story, not the disabled-Upgrade-button one —
  // a native disabled button can't receive focus at all, so it can't
  // exercise the focus-triggered path.
  await page.goto("/iframe.html?id=family-c-navigation-overlays-tooltip--on-icon-button");

  await page.getByRole("button", { name: "Info" }).focus();
  await expect(page.getByText("Delete this project")).toBeVisible();
});

test("the wrapped trigger remains a real, usable component", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-tooltip--sides");

  const topButton = page.getByRole("button", { name: "top" });
  await expect(topButton).toBeVisible();
  await expect(topButton).toBeEnabled();
});
