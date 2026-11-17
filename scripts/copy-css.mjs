#!/usr/bin/env node
/**
 * Build step for B4's "no CSS tooling required" promise: CSS is hand
 * authored under each package's src/, and this script copies individual
 * files to dist/ (so per-theme exports like @b4/tokens/css/graphite keep
 * working) and also inlines @import statements for each package's single
 * entry file, producing one self-contained, portable stylesheet.
 */
import { readFileSync, writeFileSync, cpSync, existsSync, readdirSync, mkdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";

const pkgName = process.argv[2];
if (!pkgName) {
  console.error("Usage: node copy-css.mjs <package-dir-name>");
  process.exit(1);
}

const pkgDir = process.cwd();
const srcDir = join(pkgDir, "src");
const distDir = join(pkgDir, "dist");

if (!existsSync(srcDir)) {
  console.error(`No src/ directory found at ${srcDir}`);
  process.exit(1);
}

mkdirSync(distDir, { recursive: true });

/** Recursively mirrors every *.css file from src/ into the matching dist/ path. */
function copyAllCss(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const srcPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      copyAllCss(srcPath);
    } else if (entry.name.endsWith(".css")) {
      const relative = srcPath.slice(srcDir.length);
      const destPath = join(distDir, relative);
      mkdirSync(dirname(destPath), { recursive: true });
      cpSync(srcPath, destPath);
    }
  }
}

/** Resolves @import "./relative.css"; statements inline, depth-first. */
function inlineImports(filePath, seen = new Set()) {
  const resolved = resolve(filePath);
  if (seen.has(resolved)) return "";
  seen.add(resolved);

  const content = readFileSync(resolved, "utf8");
  return content.replace(
    /@import\s+["']([^"']+\.css)["'];/g,
    (_match, importPath) => inlineImports(join(dirname(resolved), importPath), seen),
  );
}

copyAllCss(srcDir);

for (const entry of ["index.css", "styles.css"]) {
  const entryPath = join(srcDir, entry);
  if (existsSync(entryPath)) {
    const bundled = inlineImports(entryPath);
    const outName = pkgName === "tokens" ? "b4-tokens.css" : entry;
    writeFileSync(join(distDir, outName), bundled);
  }
}

console.log(`[${pkgName}] CSS built to dist/`);
