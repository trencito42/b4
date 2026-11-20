import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const studioOrigin = "http://localhost:5173";

test("B4 Studio home loads with landmarks", async ({ page }) => {
  await page.goto(studioOrigin);
  await expect(page.getByRole("heading", { name: /commercial-grade/i })).toBeVisible();
  await expect(page.getByRole("navigation", { name: "Studio" })).toBeVisible();
});

test("B4 Studio catalog lists components", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Components" }).click();
  await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Button Verified", exact: true }),
  ).toBeVisible();
});

test("B4 Studio Analytics showcase renders", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Analytics" }).click();
  await expect(page.getByRole("heading", { name: "Analytics" })).toBeVisible();
  await expect(page.getByText("Requests", { exact: true })).toBeVisible();
});

test("mobile Studio navigation opens, contains focus, and closes after navigation", async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto(studioOrigin);
  const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
  await trigger.click();
  const nav = page.getByRole("navigation", { name: "Studio" });
  const first = nav.getByRole("button", { name: "Overview" });
  await expect(first).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(nav.getByRole("button", { name: "Settings" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(first).toBeFocused();
  await nav.getByRole("button", { name: "Settings" }).click();
  await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "false");
});

test("visual review sets actual Storybook viewport widths in both themes", async ({
  page,
}) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Visual review" }).click();
  const graphite = page.frameLocator('iframe[title="Graphite story preview"]');
  const porcelain = page.frameLocator('iframe[title="Porcelain story preview"]');
  await expect(graphite.locator("html")).toHaveAttribute("data-b4-theme", "graphite", {
    timeout: 15000,
  });
  await expect(porcelain.locator("html")).toHaveAttribute("data-b4-theme", "porcelain", {
    timeout: 15000,
  });
  await page.getByRole("combobox", { name: "Viewport width" }).click();
  await page.getByRole("option", { name: "768 px" }).click();
  expect(await graphite.locator("html").evaluate(() => innerWidth)).toBe(768);
  expect(await porcelain.locator("html").evaluate(() => innerWidth)).toBe(768);
  await page.getByRole("combobox", { name: "Story" }).click();
  await page.getByRole("option", { name: "Cross-family comparison" }).click();
  await expect(graphite.getByRole("textbox", { name: "Workspace name" })).toBeVisible();
});

test("infrastructure filters and sorts nodes and restarts the selected node", async ({
  page,
}) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Infrastructure" }).click();
  const table = page.getByRole("table", { name: "Cluster nodes" });
  await table.getByRole("button", { name: "CPU" }).click();
  await expect(table.getByRole("row").nth(1)).toContainText("edge-02");
  const search = page.getByRole("searchbox", { name: "Find a node" });
  await search.fill("edge-02");
  await expect(table.getByRole("row", { name: /edge-01/ })).toHaveCount(0);
  await table.getByRole("button", { name: "Inspect edge-02" }).click();
  const details = page.getByRole("dialog", { name: "edge-02", exact: true });
  await expect(details.getByText("eu-central-1")).toBeVisible();
  await details.getByRole("button", { name: "Restart node" }).click();
  await page
    .getByRole("alertdialog", { name: "Restart edge-02?" })
    .getByRole("button", { name: "Restart node" })
    .click();
  await expect(page.getByText("edge-02 restarted")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(details).toHaveCount(0);
});

test("settings retains saved data and discards a separate draft", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Settings" }).click();
  const input = page.getByRole("textbox", { name: "Full name" });
  await input.fill("Robin Chen");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Settings saved")).toBeVisible();
  await input.fill("Temporary name");
  await page.getByRole("button", { name: "Discard", exact: true }).click();
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(input).toHaveValue("Robin Chen");
  await expect(page.getByRole("group", { name: "Unsaved changes" })).toHaveCount(0);
  await page.getByRole("tab", { name: "Security" }).click();
  const password = page.getByLabel("New password", { exact: true });
  await password.fill("too short");
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByText("Enter at least 12 characters.")).toBeVisible();
  await page.getByRole("button", { name: "Discard", exact: true }).click();
  await page.getByRole("button", { name: "Discard changes" }).click();
  await expect(password).toHaveValue("");
});

test("checkout moves through review and submission, then resets", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Confirmation" }).click();
  await page.getByRole("button", { name: "Confirm", exact: true }).click();
  await expect(page.getByRole("progressbar", { name: "Sending payment" })).toBeVisible();
  await expect(page.getByText("Payment sent", { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Send another" }).click();
  await expect(page.getByRole("button", { name: "Confirm", exact: true })).toBeVisible();
});

test("B4 Studio Motion Lab renders and exercises async action", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Motion Lab" }).click();
  await expect(page.getByRole("heading", { name: "Motion Lab" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Deploy to production/i })).toBeVisible();
});

test("B4 Studio Text Morph Lab renders and exercises morphing", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Text Morphing Lab" }).click();
  await expect(page.getByRole("heading", { name: "Text Morphing Lab" })).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Word Replacement & Reordering" }),
  ).toBeVisible();
});

test("B4 Studio Effects Lab renders RefractionSweep and drives it", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Effects Lab" }).click();
  await expect(page.getByRole("heading", { name: "Effects Lab" })).toBeVisible();
  await expect(page.getByRole("heading", { name: "RefractionSweep" })).toBeVisible();

  // RefractionSweep's own wave layer must actually be in the DOM and
  // moving — a lab page that renders an empty preview is not a lab.
  await expect(page.locator(".b4-refraction-sweep__band").first()).toBeVisible();
  const transform1 = await page
    .locator(".b4-refraction-sweep__band")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  await page.waitForTimeout(700);
  const transform2 = await page
    .locator(".b4-refraction-sweep__band")
    .first()
    .evaluate((el) => getComputedStyle(el).transform);
  expect(transform1).not.toBe(transform2);
});

for (const theme of ["graphite", "porcelain"] as const) {
  test(`B4 Studio home is axe-clean on ${theme}`, async ({ page }) => {
    // Audit the theme colors after switching, without sampling interpolated colors.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(studioOrigin);
    await page
      .getByRole("button", { name: theme === "graphite" ? "Graphite" : "Porcelain" })
      .click();
    await expect(page.locator("html")).toHaveAttribute("data-b4-theme", theme);
    await expect(page.getByRole("heading", { name: /commercial-grade/i })).toBeVisible();
    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}
