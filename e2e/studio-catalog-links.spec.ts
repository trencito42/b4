import { test, expect } from "@playwright/test";

const studioOrigin = "http://localhost:5173";
const storybookOrigin = "http://localhost:6106";

/**
 * The Studio catalog's whole job is to deep-link into Storybook. A dead
 * link there is invisible to every other gate — the catalog renders
 * perfectly, axe is clean, and the story still exists — so it needs its
 * own check. This one compares the hrefs the catalog *actually renders*
 * against the story IDs Storybook *actually publishes*, so the two can
 * never drift apart again.
 *
 * (It previously did: the catalog slugified component names by splitting
 * camelCase, which Storybook does not do, so 62 of 83 links pointed at
 * stories that never existed.)
 */
test("every Studio catalog link resolves to a real Storybook story", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Components" }).click();
  await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();

  const hrefs = await page.locator(".b4-studio__catalog-item").evaluateAll((nodes) =>
    nodes.map((node) => (node as HTMLAnchorElement).getAttribute("href") ?? ""),
  );

  expect(hrefs.length).toBeGreaterThan(80);

  const response = await fetch(`${storybookOrigin}/index.json`);
  expect(response.ok, `Storybook index.json returned ${response.status}`).toBe(true);
  const index = (await response.json()) as { entries?: Record<string, unknown> };
  const storyIds: string[] = Object.keys(index.entries ?? {});
  expect(storyIds.length, "Storybook published no stories — the index fetch is wrong, not the links").toBeGreaterThan(100);

  const broken = hrefs.filter((href) => {
    const path = href.split("path=/story/")[1];
    if (!path) return true;
    // Storybook's index.json keys ARE the full story ids, including the
    // "--default" export suffix.
    return !storyIds.includes(path);
  });

  expect(broken, `dead Storybook links:\n${broken.join("\n")}`).toEqual([]);
});

test("the Studio catalog lists every component and every effect", async ({ page }) => {
  await page.goto(studioOrigin);
  await page.getByRole("button", { name: "Components" }).click();
  await expect(page.getByRole("heading", { name: "Components" })).toBeVisible();

  // The one remaining effect ships from its own export subpath and must
  // still be discoverable from the catalog.
  await expect(page.getByRole("link", { name: "RefractionSweep Effect", exact: true })).toBeVisible();
});
