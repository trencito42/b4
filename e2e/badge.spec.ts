import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

for (const theme of ["graphite", "porcelain"] as const) {
  test(`Badge all-tones story is axe-clean (incl. color-contrast) on ${theme}`, async ({
    page,
  }) => {
    await page.goto(
      `/iframe.html?id=family-a-actions-identity-badge--all-tones&globals=b4Theme:${theme}`,
    );

    await expect(page.getByText("Danger")).toBeVisible();

    const results = await new AxeBuilder({ page })
      .disableRules(["page-has-heading-one", "landmark-one-main", "region"])
      .analyze();
    expect(results.violations).toEqual([]);
  });
}
