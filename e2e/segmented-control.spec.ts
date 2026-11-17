import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("SegmentedControl Changelog/Login story renders, is axe-clean, and is keyboard operable", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=family-a-actions-identity-segmentedcontrol--changelog-login",
  );

  const changelog = page.getByRole("button", { name: "Changelog" });
  const login = page.getByRole("button", { name: "Login" });

  await expect(changelog).toBeVisible();
  await expect(changelog).toHaveAttribute("data-pressed", "");

  await changelog.focus();
  await page.keyboard.press("ArrowRight");
  await expect(login).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(login).toHaveAttribute("data-pressed", "");
  await expect(changelog).not.toHaveAttribute("data-pressed");

  const results = await new AxeBuilder({ page })
    .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("SegmentedControl indicator never duplicates under rapid repeated clicks", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=family-a-actions-identity-segmentedcontrol--three-way",
  );

  const day = page.getByRole("button", { name: "Day" });
  const week = page.getByRole("button", { name: "Week" });
  const month = page.getByRole("button", { name: "Month" });

  for (let i = 0; i < 12; i++) {
    const target = [day, week, month][i % 3];
    await target?.click({ delay: 5 });
  }

  await expect(page.locator(".b4-segmented-control__indicator")).toHaveCount(1);
});
