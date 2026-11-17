import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`Tabs is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(
      `/iframe.html?id=family-c-navigation-overlays-tabs--default&globals=b4Theme:${theme}`,
    );
    await expect(page.getByRole("tab", { name: "General" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("Tabs switches panels on click and with arrow+Enter keyboard navigation", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-tabs--default");

  await page.getByRole("tab", { name: "Members" }).click();
  await expect(page.getByText("Manage who has access.")).toBeVisible();

  await page.getByRole("tab", { name: "General" }).focus();
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("ArrowRight");
  await page.keyboard.press("Enter");
  await expect(page.getByText("Plan and invoices.")).toBeVisible();
});

test("Tabs traveling indicator moves to the active tab without leaving a duplicate", async ({
  page,
}) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-tabs--default");

  await page.getByRole("tab", { name: "Billing" }).click();
  await expect(page.locator(".b4-tabs__indicator")).toHaveCount(1);

  const generalTab = page.getByRole("tab", { name: "General" });
  const indicator = page.locator(".b4-tabs__indicator");
  await generalTab.click();
  // Wait for the CSS left/width transition to finish before comparing
  // positions — sampling mid-transition would compare against a
  // still-interpolating value, not a real defect.
  await page.waitForTimeout(250);

  const generalBox = await generalTab.boundingBox();
  const indicatorBox = await indicator.boundingBox();
  expect(Math.abs((generalBox?.x ?? 0) - (indicatorBox?.x ?? 0))).toBeLessThan(2);
});

test("Tabs disabled tab cannot be activated", async ({ page }) => {
  await page.goto("/iframe.html?id=family-c-navigation-overlays-tabs--with-disabled-tab");

  const disabledTab = page.getByRole("tab", { name: "Billing (upgrade required)" });
  await expect(disabledTab).toHaveAttribute("aria-disabled", "true");
});
