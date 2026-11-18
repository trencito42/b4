import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

// "aria-hidden-focus" flags Base UI's own internal focus-guard sentinel
// spans (`data-base-ui-focus-guard`) — deliberately `aria-hidden="true"`
// + `tabindex="0"` so Tab/Shift+Tab at the popup's edge gets caught and
// redirected back inside. Standard focus-sentinel technique, not a
// defect; same exception used in e2e/context-hover.spec.ts and friends.
const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region", "aria-hidden-focus"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`NavigationMenu is axe-clean when a section is open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-navigationmenu--default&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: "Products" }).click();
    await expect(page.getByRole("link", { name: /Overview/ })).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("NavigationMenu opens a section's content on click and the links are real, usable links", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-navigationmenu--default");

  await expect(page.getByRole("link", { name: /Overview/ })).toHaveCount(0);
  await page.getByRole("button", { name: "Products" }).click();

  const overviewLink = page.getByRole("link", { name: /Overview/ });
  await expect(overviewLink).toBeVisible();
  await expect(overviewLink).toHaveAttribute("href", "/products");
});

test("NavigationMenu switches content when the mouse moves to a sibling trigger", async ({ page }) => {
  // Base UI's Trigger opens "when hovered or clicked" (its own docstring).
  // Once a section is open, moving the pointer onto a sibling trigger
  // switches instantly via hover — that's the intended mega-menu UX, and
  // the one real users actually perform (the cursor must cross the
  // trigger before a click can land on it). Clicking a trigger that's
  // *already* the open one, by contrast, toggles it closed — it behaves
  // like a close button once active, not a second "open" action.
  await page.goto("/iframe.html?id=family-c-navigation-overlays-navigationmenu--default");

  await page.getByRole("button", { name: "Products" }).click();
  await expect(page.getByRole("link", { name: /Overview/ })).toBeVisible();

  const resourcesBox = await page.getByRole("button", { name: "Resources" }).boundingBox();
  await page.mouse.move(resourcesBox!.x + resourcesBox!.width / 2, resourcesBox!.y + resourcesBox!.height / 2, {
    steps: 5,
  });
  await expect(page.getByRole("link", { name: "Documentation" })).toBeVisible();
  await expect(page.getByRole("link", { name: /Overview/ })).toHaveCount(0);
});

test("NavigationMenu closes an already-open trigger when it's clicked again", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-navigationmenu--default");

  const trigger = page.getByRole("button", { name: "Products" });
  await trigger.click();
  await expect(page.getByRole("link", { name: /Overview/ })).toBeVisible();

  await trigger.click();
  await expect(page.getByRole("link", { name: /Overview/ })).toHaveCount(0);
});

test("NavigationMenu closes when Escape is pressed", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-navigationmenu--default");

  await page.getByRole("button", { name: "Products" }).click();
  await expect(page.getByRole("link", { name: /Overview/ })).toBeVisible();

  await page.keyboard.press("Escape");
  await expect(page.getByRole("link", { name: /Overview/ })).toHaveCount(0);
});
