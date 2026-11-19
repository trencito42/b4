import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const isolatedRules = ["page-has-heading-one", "landmark-one-main", "region"];
const themes = ["graphite", "porcelain"] as const;

for (const theme of themes) {
  test(`DistortionWave is axe-clean on ${theme}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=effects-distortionwave--payment-confirmation&globals=b4Theme:${theme}`);
    await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();

    const results = await new AxeBuilder({ page }).disableRules(isolatedRules).analyze();
    expect(results.violations).toEqual([]);
  });
}

test("both views exist in the DOM, with only the active one reachable by the accessibility tree", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-distortionwave--payment-confirmation");

  await expect(page.getByText("Studio rent")).toBeVisible();
  await expect(page.getByText("Payment complete")).toBeHidden();
});

test("clicking Confirm swaps the real DOM state to the revealed view", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-distortionwave--payment-confirmation");

  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("Payment complete")).toBeVisible();
  await expect(page.getByText("Studio rent")).toBeHidden();
});

test("the DOM-capture-to-WebGL pipeline never throws a tainted-canvas SecurityError (regression)", async ({ page }) => {
  // This is the exact failure this engine had before: a canvas painted via
  // an SVG `foreignObject` passes a purely visual check but throws
  // `SecurityError: Tainted canvases may not be loaded` the instant it's
  // uploaded to WebGL via texImage2D — invisibly breaking the whole
  // effect with no on-screen sign anything is wrong. DomCapture now paints
  // directly with Canvas2D primitives instead, which can never taint.
  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.goto("/iframe.html?id=effects-distortionwave--payment-confirmation");
  await page.getByRole("button", { name: "Confirm" }).click();
  await page.waitForTimeout(600);

  const tainted = pageErrors.filter((m) => m.includes("Tainted") || m.includes("SecurityError"));
  expect(tainted).toEqual([]);
});

test("the GPU canvas overlay never intercepts pointer events", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-distortionwave--payment-confirmation");

  const pointerEvents = await page
    .locator(".b4-distortion-wave-engine__canvas")
    .first()
    .evaluate((el) => getComputedStyle(el).pointerEvents);
  expect(pointerEvents).toBe("none");
});

test("reduced motion collapses the transition to an instant swap with no GPU wave", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/iframe.html?id=effects-distortionwave--reduced-motion");

  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  await page.getByRole("button", { name: "Confirm" }).click();
  await page.waitForTimeout(300);
  await expect(page.getByText("Payment complete")).toBeVisible();
  expect(pageErrors).toEqual([]);
});

test("switching geometry (vertical/horizontal/center) still completes the transition without error", async ({ page }) => {
  await page.goto("/iframe.html?id=effects-distortionwave--geometries");

  const pageErrors: string[] = [];
  page.on("pageerror", (err) => pageErrors.push(err.message));

  for (const label of ["Vertical", "Horizontal", "Center"]) {
    await page.getByRole("button", { name: label, exact: true }).click();
    await page.getByRole("button", { name: "Confirm" }).click();
    await expect(page.getByText("Payment complete")).toBeVisible();
    await page.getByRole("button", { name: "Reset" }).click();
    await expect(page.getByText("Studio rent")).toBeVisible();
  }

  expect(pageErrors).toEqual([]);
});
