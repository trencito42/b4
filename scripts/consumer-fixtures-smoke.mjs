/**
 * Consumer fixture smoke test.
 *
 * Builds the two internal fixture apps under `examples/` the way a real
 * consumer builds them, and asserts that they only reach for public
 * `@b4/react` entry points.
 *
 * Run from the repo root, after the workspace packages have been built:
 *   node scripts/consumer-fixtures-smoke.mjs
 *
 * Exits non-zero if either fixture fails to build, produces no `dist`, or
 * imports anything other than a public entry point.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const fixtures = [
  { name: "ops-console", dir: join(root, "examples", "ops-console") },
  { name: "storefront", dir: join(root, "examples", "storefront") },
];

/** The only package entry points a consumer fixture is allowed to import. */
const ALLOWED_PACKAGE_IMPORTS = new Set([
  "@b4/react",
  "@b4/react/effects",
  "@b4/react/styles.css",
  "@b4/tokens/css",
]);

const SOURCE_EXTENSIONS = new Set([".ts", ".tsx", ".js", ".jsx", ".css", ".html"]);

function resolveViteBin(fixtureDir) {
  const require = createRequire(join(fixtureDir, "package.json"));
  const manifestPath = require.resolve("vite/package.json");
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const binRelative = typeof manifest.bin === "string" ? manifest.bin : manifest.bin?.vite;
  if (!binRelative) {
    throw new Error(
      `consumer-fixtures-smoke: could not find the vite CLI entry point for ${fixtureDir}.`,
    );
  }
  return join(dirname(manifestPath), binRelative);
}

function collectSourceFiles(dir) {
  if (!existsSync(dir)) return [];
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectSourceFiles(full));
    } else if (SOURCE_EXTENSIONS.has(full.slice(full.lastIndexOf(".")))) {
      files.push(full);
    }
  }
  return files;
}

/**
 * A fixture may import `@b4/react` and `@b4/react/effects` — nothing else.
 * A deep path such as `@b4/react/dist/...` or a relative hop into
 * `packages/react/src` bypasses the public API surface and is a defect.
 */
function findDisallowedImports(fixtureDir) {
  const offenders = [];
  const importPattern = /(?:from|import)\s*["']([^"']+)["']/g;

  for (const file of collectSourceFiles(join(fixtureDir, "src"))) {
    const source = readFileSync(file, "utf8");
    for (const match of source.matchAll(importPattern)) {
      const specifier = match[1];
      if (!specifier) continue;

      if (specifier.startsWith("@b4/")) {
        if (!ALLOWED_PACKAGE_IMPORTS.has(specifier)) {
          offenders.push(`${relative(root, file)} → ${specifier}`);
        }
        continue;
      }

      const reachesIntoPackages =
        specifier.includes("@b4/react") ||
        specifier.includes("@b4/tokens") ||
        /(^|\/)packages\/(react|tokens|motion)\//.test(specifier);
      if (reachesIntoPackages) {
        offenders.push(`${relative(root, file)} → ${specifier}`);
      }
    }
  }

  return offenders;
}

for (const fixture of fixtures) {
  const offenders = findDisallowedImports(fixture.dir);
  if (offenders.length > 0) {
    throw new Error(
      `consumer-fixtures-smoke: ${fixture.name} imports non-public entry points:\n  ${offenders.join("\n  ")}`,
    );
  }
}

for (const fixture of fixtures) {
  const viteBin = resolveViteBin(fixture.dir);
  const build = spawnSync(process.execPath, [viteBin, "build"], {
    cwd: fixture.dir,
    stdio: "inherit",
  });

  if (build.error) {
    throw new Error(
      `consumer-fixtures-smoke: could not run vite for ${fixture.name}: ${build.error.message}`,
    );
  }
  if (build.status !== 0) {
    throw new Error(`consumer-fixtures-smoke: ${fixture.name} build failed.`);
  }

  const indexHtml = join(fixture.dir, "dist", "index.html");
  if (!existsSync(indexHtml)) {
    throw new Error(`consumer-fixtures-smoke: ${fixture.name} produced no dist/index.html.`);
  }

  console.log(`consumer-fixtures-smoke: ${fixture.name} built (dist/index.html).`);
}

console.log("consumer-fixtures-smoke: all consumer fixtures build from public @b4/react entry points.");
