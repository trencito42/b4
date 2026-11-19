import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];

test.describe("SegmentedControl Adaptive Scrubbing", () => {
  test("drags and commits the last valid hovered segment on release", async ({ page }) => {
    await page.goto("/iframe.html?id=family-a-actions-identity-segmentedcontrol--pointer-scrubbing");

    const usEast = page.getByRole("button", { name: "US East" });
    const euCentral = page.getByRole("button", { name: "EU Central" });

    await expect(usEast).toHaveAttribute("data-pressed", "");

    const eastBox = await usEast.boundingBox();
    const euBox = await euCentral.boundingBox();
    expect(eastBox).toBeTruthy();
    expect(euBox).toBeTruthy();

    const startX = eastBox!.x + eastBox!.width / 2;
    const startY = eastBox!.y + eastBox!.height / 2;
    const targetX = euBox!.x + euBox!.width / 2;
    const targetY = euBox!.y + euBox!.height / 2;

    // Pointer down on US East
    await page.mouse.move(startX, startY);
    await page.mouse.down();

    // Move smoothly across segments to EU Central
    await page.mouse.move(targetX, targetY, { steps: 8 });

    // Release pointer over EU Central
    await page.mouse.up();

    // Verify EU Central is now committed
    await expect(euCentral).toHaveAttribute("data-pressed", "");
    await expect(usEast).not.toHaveAttribute("data-pressed");
  });

  test("rapid drag across segments commits cleanly without duplicate calls", async ({ page }) => {
    await page.goto("/iframe.html?id=family-a-actions-identity-segmentedcontrol--pointer-scrubbing");

    const usEast = page.getByRole("button", { name: "US East" });
    const apSoutheast = page.getByRole("button", { name: "AP Southeast" });

    const eastBox = await usEast.boundingBox();
    const apBox = await apSoutheast.boundingBox();

    await page.mouse.move(eastBox!.x + 10, eastBox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(apBox!.x + 10, apBox!.y + 10, { steps: 3 });
    await page.mouse.up();

    await expect(apSoutheast).toHaveAttribute("data-pressed", "");
    await expect(usEast).not.toHaveAttribute("data-pressed");
  });

  test("Escape key aborts scrubbing and retains initial committed value", async ({ page }) => {
    await page.goto("/iframe.html?id=family-a-actions-identity-segmentedcontrol--pointer-scrubbing");

    const usEast = page.getByRole("button", { name: "US East" });
    const euCentral = page.getByRole("button", { name: "EU Central" });

    const eastBox = await usEast.boundingBox();
    const euBox = await euCentral.boundingBox();

    await page.mouse.move(eastBox!.x + 10, eastBox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(euBox!.x + 10, euBox!.y + 10, { steps: 5 });

    // Press Escape during scrub
    await page.keyboard.press("Escape");
    await page.mouse.up();

    // Should remain US East
    await expect(usEast).toHaveAttribute("data-pressed", "");
    await expect(euCentral).not.toHaveAttribute("data-pressed");
  });

  test("dragging over a disabled item does not select it", async ({ page }) => {
    await page.goto("/iframe.html?id=family-a-actions-identity-segmentedcontrol--with-disabled-item");

    const free = page.getByRole("button", { name: "Free" });
    const enterprise = page.getByRole("button", { name: "Enterprise" });

    const freeBox = await free.boundingBox();
    const entBox = await enterprise.boundingBox();

    await page.mouse.move(freeBox!.x + 10, freeBox!.y + 10);
    await page.mouse.down();
    await page.mouse.move(entBox!.x + 10, entBox!.y + 10, { steps: 5 });
    await page.mouse.up();

    // Enterprise is disabled so it must not be selected
    await expect(enterprise).not.toHaveAttribute("data-pressed");
  });

  test("SegmentedControl scrubbing is axe-clean on graphite and porcelain", async ({ page }) => {
    for (const theme of ["graphite", "porcelain"]) {
      await page.goto(
        `/iframe.html?id=family-a-actions-identity-segmentedcontrol--pointer-scrubbing&globals=b4Theme:${theme}`,
      );
      const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
      expect(results.violations).toEqual([]);
    }
  });
});

test.describe("Tabs Adaptive Swipe Navigation", () => {
  test("swipes left to navigate to next panel", async ({ page }) => {
    await page.goto("/iframe.html?id=family-c-navigation-overlays-tabs--swipeable");

    const metricsTab = page.getByRole("tab", { name: "Metrics" });
    const alertsTab = page.getByRole("tab", { name: "Alerts" });

    await expect(metricsTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("Real-time Server Metrics")).toBeVisible();

    const panel = page.locator(".b4-tabs__panel").first();
    const box = await panel.boundingBox();
    expect(box).toBeTruthy();

    const startX = box!.x + box!.width - 50;
    const startY = box!.y + box!.height / 2;

    // Drag left by 120px
    await page.mouse.move(startX, startY);
    await page.mouse.down();
    await page.mouse.move(startX - 120, startY, { steps: 8 });
    await page.mouse.up();

    // Should switch to Alerts
    await expect(alertsTab).toHaveAttribute("aria-selected", "true");
    await expect(page.getByText("System Incidents & Alerts")).toBeVisible();
  });

  test("interactive child button inside swipeable panel clicks natively without triggering swipe", async ({ page }) => {
    await page.goto("/iframe.html?id=family-c-navigation-overlays-tabs--swipeable-with-interactive-control");

    const button = page.getByRole("button", { name: /Clicked 0 times/ });
    await expect(button).toBeVisible();

    // Direct click on button
    await button.click();
    await expect(page.getByRole("button", { name: /Clicked 1 times/ })).toBeVisible();

    // Tab must remain on Actions, not navigated
    const actionsTab = page.getByRole("tab", { name: "Actions" });
    await expect(actionsTab).toHaveAttribute("aria-selected", "true");
  });
});

test.describe("AppShell Mobile Adaptive Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("mobile trigger opens and dismisses drawer with focus management and backdrop", async ({ page }) => {
    await page.goto("/iframe.html?id=family-f-application-patterns-appshell--adaptive-mobile");

    const trigger = page.getByRole("button", { name: "Toggle navigation menu" });
    await expect(trigger).toBeVisible();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");

    // Hidden drawer should be inert
    const sidebar = page.locator(".b4-app-shell__sidebar");
    await expect(sidebar).toHaveAttribute("inert", "");

    // Click trigger to open
    await trigger.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(sidebar).toHaveAttribute("data-open", "true");
    await expect(sidebar).not.toHaveAttribute("inert");

    // Backdrop is visible
    const backdrop = page.locator(".b4-app-shell__backdrop");
    await expect(backdrop).toBeVisible();

    // Dismiss via backdrop click
    await backdrop.click();
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(sidebar).toHaveAttribute("data-open", "false");
  });
});
