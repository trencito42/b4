import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`NotificationPanel is axe-clean when open on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-e-feedback-motion-notificationpanel--default&globals=b4Theme:${theme}`,
    );
    await page.getByRole("button", { name: "Notifications" }).click();
    await expect(page.getByText("New comment on your draft")).toBeVisible();
    await page.waitForTimeout(300);

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("NotificationPanel opens on trigger click and lists notifications", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-notificationpanel--default");

  await expect(page.getByText("New comment on your draft")).toHaveCount(0);
  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByText("New comment on your draft")).toBeVisible();
  await expect(page.getByText("Deploy succeeded")).toBeVisible();
  await expect(page.getByText("Weekly summary ready")).toBeVisible();
});

test("NotificationPanel marks an item read when clicked", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-notificationpanel--default");

  await page.getByRole("button", { name: "Notifications" }).click();
  const firstItem = page.getByRole("button", { name: /New comment on your draft/ });
  await expect(firstItem).toHaveClass(/--unread/);

  await firstItem.click();
  await expect(firstItem).not.toHaveClass(/--unread/);
});

test("NotificationPanel marks all notifications read via the header action", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-notificationpanel--default");

  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByRole("button", { name: "Mark all as read" })).toBeVisible();

  await page.getByRole("button", { name: "Mark all as read" }).click();
  await expect(page.getByRole("button", { name: "Mark all as read" })).toHaveCount(0);
});

test("NotificationPanel shows an empty message when there are no notifications", async ({ page }) => {
  await page.goto("/iframe.html?id=family-e-feedback-motion-notificationpanel--empty");

  await page.getByRole("button", { name: "Notifications" }).click();
  await expect(page.getByText("No notifications")).toBeVisible();
});
