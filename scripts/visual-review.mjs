import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { chromium } from "@playwright/test";

const origin = process.env.B4_REVIEW_ORIGIN ?? "http://localhost:6106";
const output = process.argv[2] ?? "test-results/visual-review";
const widths = [320, 390, 768, 1024, 1440, 1920];
const themes = ["graphite", "porcelain"];
const index = await fetch(new URL("index.json", origin));
if (!index.ok) throw new Error(`Storybook index returned ${index.status}`);
const { entries } = await index.json();
const defaults = Object.values(entries).filter(
  ({ id, type }) => type === "story" && id.endsWith("--default"),
);
if (!defaults.length) throw new Error("Storybook index has no default stories");

await mkdir(output, { recursive: true });
const browser = await chromium.launch();
const pending = defaults.flatMap(({ id, title }) =>
  themes.flatMap((theme) => widths.map((width) => ({ id, title, theme, width }))),
);
const total = pending.length;
const results = [];

try {
  await Promise.all(
    Array.from({ length: 4 }, async () => {
      const page = await browser.newPage({ reducedMotion: "reduce" });
      const errors = [];
      page.on("pageerror", (error) => errors.push(error.message));
      for (let item; (item = pending.shift());) {
        errors.length = 0;
        const { id, theme, width } = item;
        const filename = `${id}-${theme}-${width}.png`;
        const url = new URL("iframe.html", origin);
        url.search = new URLSearchParams({
          id,
          viewMode: "story",
          globals: `b4Theme:${theme};b4Motion:reduced`,
        });
        try {
          await page.setViewportSize({ width, height: 900 });
          await page.goto(url.href, { waitUntil: "domcontentloaded", timeout: 15000 });
          await page.waitForFunction(
            (theme) =>
              document.documentElement.dataset.b4Theme === theme &&
              document.querySelector("#storybook-root")?.childElementCount > 0,
            theme,
            { timeout: 10000 },
          );
          await page.evaluate(() => document.fonts.ready);
          const overflow = await page.evaluate(() =>
            Math.max(0, document.documentElement.scrollWidth - innerWidth),
          );
          await page.screenshot({
            path: join(output, filename),
            animations: "disabled",
            timeout: 10000,
          });
          results.push({ ...item, filename, overflow, errors: [...errors] });
        } catch (error) {
          results.push({ ...item, errors: [...errors, error.message] });
        }
        if (results.length % 120 === 0)
          console.log(`Visual review: ${results.length}/${total} captures processed`);
      }
      await page.close();
    }),
  );
} finally {
  await browser.close();
}

results.sort(
  (a, b) =>
    a.id.localeCompare(b.id) || a.theme.localeCompare(b.theme) || a.width - b.width,
);
const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll('"', "&quot;");
const groups = Map.groupBy(results, ({ id }) => id);
const sections = [...groups.values()]
  .map(
    (group) =>
      `<section><h2>${escapeHtml(group[0].title)}</h2><div class="grid">${group
        .map((item) => {
          const caption = escapeHtml(
            `${item.theme} · ${item.width}px${item.overflow ? ` · overflow ${item.overflow}px` : ""}`,
          );
          const image = item.filename
            ? `<a href="${escapeHtml(item.filename)}"><img loading="lazy" src="${escapeHtml(item.filename)}" alt="${caption}"></a>`
            : "";
          return `<figure>${image}<figcaption>${caption}</figcaption>${item.errors.map((error) => `<p>${escapeHtml(error)}</p>`).join("")}</figure>`;
        })
        .join("")}</div></section>`,
  )
  .join("");
await writeFile(
  join(output, "index.html"),
  `<!doctype html><meta charset="utf-8"><title>B4 visual review</title><style>body{font:16px system-ui;margin:2rem;background:#141518;color:#f2f2f3}.grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:1rem}figure{margin:0}img{width:100%;height:180px;object-fit:contain;background:#292a2e}figcaption{padding:.4rem 0}</style><h1>B4 visual review</h1>${sections}`,
);
await writeFile(join(output, "results.json"), JSON.stringify(results, null, 2));
const failures = results.filter(({ errors }) => errors.length);
const overflow = results.filter((item) => item.overflow > 1);
console.log(
  `${results.length} captures across ${defaults.length} default stories. ${failures.length} render failures. ${overflow.length} viewports with horizontal overflow.`,
);
if (failures.length || overflow.length) process.exitCode = 1;
