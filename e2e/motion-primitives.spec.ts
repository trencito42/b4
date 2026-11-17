import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test("TextTransition manual-control story swaps labels and stays axe-clean", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=family-e-feedback-motion-texttransition--manual-control",
  );

  const display = page.locator(".b4-text-transition__item").last();
  await expect(display).toHaveText("Idle");

  await page.getByRole("button", { name: "Success" }).click();
  await expect(display).toHaveText("Success");

  await page.getByRole("button", { name: "Error" }).click();
  await expect(display).toHaveText("Error");

  const results = await new AxeBuilder({ page })
    .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
    .analyze();
  expect(results.violations).toEqual([]);
});

test("NumberTransition up-and-down story updates the displayed value under rapid clicks", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=family-e-feedback-motion-numbertransition--up-and-down",
  );

  await expect(page.getByText("100", { exact: true })).toBeVisible();

  const plus = page.getByRole("button", { name: "+7" });
  for (let i = 0; i < 6; i++) {
    await plus.click({ delay: 10 });
  }

  await expect(page.getByText("142", { exact: true })).toBeVisible();
});

test("AnimatedIndicator story keeps exactly one indicator while moving between targets", async ({
  page,
}) => {
  await page.goto(
    "/iframe.html?id=family-e-feedback-motion-animatedindicator--between-two-targets",
  );

  const a = page.getByRole("button", { name: "A" });
  const b = page.getByRole("button", { name: "B" });

  for (let i = 0; i < 8; i++) {
    await (i % 2 === 0 ? b : a).click({ delay: 5 });
  }

  await expect(page.getByTestId("story-indicator")).toHaveCount(1);
});
