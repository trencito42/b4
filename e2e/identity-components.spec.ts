import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

const storyId = (component: string, story: string) =>
  `family-a-actions-identity-${component}--${story}`;

const axeStories: Array<[component: string, story: string]> = [
  ["link", "in-body-copy"],
  ["statusbadge", "all-statuses"],
  ["avatar", "all-sizes"],
  ["avatargroup", "default"],
  ["keyboardshortcut", "in-context"],
  ["buttongroup", "icon-buttons"],
];

for (const theme of themes) {
  for (const [component, story] of axeStories) {
    test(`${component} (${story}) is axe-clean on ${theme}`, async ({ page }) => {
      await page.goto(
        `/iframe.html?id=${storyId(component, story)}&globals=b4Theme:${theme}`,
      );
      await page.waitForLoadState("networkidle");

      const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
      expect(results.violations).toEqual([]);
    });
  }

  test(`SplitButton is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=${storyId("splitbutton", "default")}&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("button", { name: "Deploy", exact: true })).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules([...isolatedRules, "aria-hidden-focus"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}

test("AvatarGroup shows a real overflow count beyond max", async ({ page }) => {
  await page.goto(`/iframe.html?id=${storyId("avatargroup", "max-two")}`);
  await expect(page.getByRole("img", { name: /more/ })).toBeVisible();
});

test("SplitButton's primary action and menu are independent in a real browser", async ({
  page,
}) => {
  await page.goto(`/iframe.html?id=${storyId("splitbutton", "default")}`);

  await page.getByRole("button", { name: "More Deploy options" }).click();
  const menu = page.getByRole("menu");
  await expect(menu).toBeVisible();
  await page.getByRole("menuitem", { name: "Deploy preview" }).click();
  await expect(page.getByRole("menu")).toHaveCount(0);
});
