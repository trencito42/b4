#!/usr/bin/env node
/**
 * B4 craftsmanship audit — a systematic, re-runnable sweep over every
 * component in `packages/react/src/components` (and the effects entry
 * point). It does not judge taste; it checks the mechanical invariants
 * that `AGENTS.md` and `TESTING.md` actually require:
 *
 *   1. Every component has its full file set (component, CSS, stories, tests).
 *   2. Every component's CSS is either owned by it or an explicitly
 *      documented share of another component's stylesheet.
 *   3. Every owned stylesheet is registered in `src/styles.css`.
 *   4. Every component is exported from `src/index.ts`.
 *   5. Every `var(--b4-*)` a component reads actually exists — either in
 *      `@b4/tokens`, or in the component's own stylesheet, or set inline by
 *      the component itself. (The silent-failure class of bug that
 *      `HANDOFF.md` records as gotcha #10.)
 *   6. No hardcoded color literals in component CSS.
 *   7. Stories are autodocs-tagged and expose controls for variant props.
 *   8. Tests exercise `jest-axe` and assert zero violations.
 *   9. Animated components respect reduced motion.
 *   10. The repo contains no Blipmade references (hard rule).
 *
 * Exit code 1 when there are findings, so CI can gate on it.
 */
import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const REACT_SRC = join(ROOT, "packages/react/src");
const COMPONENTS_DIR = join(REACT_SRC, "components");
const EFFECTS_DIR = join(REACT_SRC, "effects");
const TOKENS_DIR = join(ROOT, "packages/tokens/src");
const E2E_DIR = join(ROOT, "e2e");

const read = (p) => {
  try {
    return readFileSync(p, "utf8");
  } catch {
    return null;
  }
};

/** Strip CSS comments so prose in comments never trips a literal check. */
const stripCssComments = (css) => css.replace(/\/\*[\s\S]*?\*\//g, "");

const kebab = (name) =>
  name
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1-$2")
    .toLowerCase();

/* ------------------------------------------------------------------ tokens */

/** Every `--b4-*` custom property the token package actually defines. */
function collectTokenNames() {
  const names = new Set();
  for (const file of readdirSync(TOKENS_DIR).filter((f) => f.endsWith(".css"))) {
    const css = read(join(TOKENS_DIR, file)) ?? "";
    for (const m of css.matchAll(/(--b4-[a-z0-9-]+)\s*:/g)) names.add(m[1]);
  }
  return names;
}

const TOKEN_NAMES = collectTokenNames();

/* ------------------------------------------------- component CSS ownership */

/**
 * Components that deliberately share another component's stylesheet.
 * Each entry MUST be justified by a line in `COMPONENT_INVENTORY.md`'s
 * "Scope changes log" — `verifyDocumentedShares()` enforces that below,
 * so a new undocumented share fails the audit instead of sliding through.
 */
const CSS_SHARES = {
  Field: ["TextField"],
  InputGroup: ["TextField"],
  NumberField: ["TextField"],
  Textarea: ["TextField"],
  SearchField: ["TextField"],
  PasswordField: ["TextField"],
  MultiSelect: ["Select"],
  SplitButton: ["Button"],
  ContextMenu: ["DropdownMenu"],
  NumberTransition: ["TextTransition"],
};

/** Components that are pure-Motion and legitimately own no stylesheet. */
const NO_CSS_BY_DESIGN = ["AnimatedIndicator", "MorphingSurface"];

/* -------------------------------------------------------------- css checks */

const NAMED_COLORS = [
  "aliceblue", "antiquewhite", "aqua", "aquamarine", "azure", "beige", "bisque",
  "black", "blanchedalmond", "blue", "blueviolet", "brown", "burlywood",
  "cadetblue", "chartreuse", "chocolate", "coral", "cornflowerblue", "cornsilk",
  "crimson", "cyan", "darkblue", "darkcyan", "darkgoldenrod", "darkgray",
  "darkgreen", "darkkhaki", "darkmagenta", "darkolivegreen", "darkorange",
  "darkorchid", "darkred", "darksalmon", "darkseagreen", "darkslateblue",
  "darkslategray", "darkturquoise", "darkviolet", "deeppink", "deepskyblue",
  "dimgray", "dodgerblue", "firebrick", "floralwhite", "forestgreen",
  "fuchsia", "gainsboro", "ghostwhite", "gold", "goldenrod", "gray", "green",
  "greenyellow", "honeydew", "hotpink", "indianred", "indigo", "ivory",
  "khaki", "lavender", "lavenderblush", "lawngreen", "lemonchiffon",
  "lightblue", "lightcoral", "lightcyan", "lightgoldenrodyellow", "lightgray",
  "lightgreen", "lightpink", "lightsalmon", "lightseagreen", "lightskyblue",
  "lightslategray", "lightsteelblue", "lightyellow", "lime", "limegreen",
  "linen", "magenta", "maroon", "mediumaquamarine", "mediumblue",
  "mediumorchid", "mediumpurple", "mediumseagreen", "mediumslateblue",
  "mediumspringgreen", "mediumturquoise", "mediumvioletred", "midnightblue",
  "mintcream", "mistyrose", "moccasin", "navajowhite", "navy", "oldlace",
  "olive", "olivedrab", "orange", "orangered", "orchid", "palegoldenrod",
  "palegreen", "paleturquoise", "palevioletred", "papayawhip", "peachpuff",
  "peru", "pink", "plum", "powderblue", "purple", "rebeccapurple", "red",
  "rosybrown", "royalblue", "saddlebrown", "salmon", "sandybrown", "seagreen",
  "seashell", "sienna", "silver", "skyblue", "slateblue", "slategray",
  "snow", "springgreen", "steelblue", "tan", "teal", "thistle", "tomato",
  "turquoise", "violet", "wheat", "white", "whitesmoke", "yellow", "yellowgreen",
  "transparent",
];

const COLOR_LITERAL_PATTERNS = [
  { kind: "hex", re: /#[0-9a-fA-F]{3,8}\b/g },
  { kind: "rgb", re: /\brgba?\(\s*[0-9]/g },
  { kind: "hsl", re: /\bhsla?\(\s*[0-9]/g },
];

function findColorLiterals(css) {
  const body = stripCssComments(css);
  const found = [];
  for (const { kind, re } of COLOR_LITERAL_PATTERNS) {
    for (const m of body.matchAll(re)) {
      const line = body.slice(0, m.index).split("\n").length;
      found.push({ kind, value: m[0], line });
    }
  }
  // Named colors are only a finding when used as a *value* (after a colon),
  // never inside a property name or a string of a non-color property.
  for (const m of body.matchAll(/:\s*([^;{}]+)/g)) {
    const value = m[1];
    if (/\b(var\(|url\(|@|calc\()/i.test(value)) continue;
    for (const color of NAMED_COLORS) {
      if (color === "transparent") continue; // a legitimate layout-independent value
      const re = new RegExp(`(^|[\\s,(])${color}([\\s,)]|$)`, "i");
      if (re.test(value)) {
        const line = body.slice(0, m.index).split("\n").length;
        found.push({ kind: "named", value: color, line });
      }
    }
  }
  return found;
}

/**
 * Every `--b4-*` a component reads must resolve. Resolvable means:
 * defined by @b4/tokens, OR declared inside the component's own stylesheet,
 * OR set as an inline custom property by the component's TSX.
 */
function findUnresolvedTokens(css, tsx) {
  const body = stripCssComments(css);
  const locallyDeclared = new Set(
    [...body.matchAll(/(--b4-[a-z0-9-]+)\s*:/g)].map((m) => m[1]),
  );
  const inlineSet = new Set([...(tsx ?? "").matchAll(/["'`](--b4-[a-z0-9-]+)["'`]\s*:/g)].map((m) => m[1]));
  const unresolved = [];
  for (const m of body.matchAll(/var\(\s*(--b4-[a-z0-9-]+)/g)) {
    const name = m[1];
    if (TOKEN_NAMES.has(name) || locallyDeclared.has(name) || inlineSet.has(name)) continue;
    const line = body.slice(0, m.index).split("\n").length;
    unresolved.push({ name, line });
  }
  return unresolved;
}

/* ------------------------------------------------------------------ audit */

const stylesCss = read(join(REACT_SRC, "styles.css")) ?? "";
const indexTs = read(join(REACT_SRC, "index.ts")) ?? "";
const inventory = read(join(ROOT, "COMPONENT_INVENTORY.md")) ?? "";

const e2eText = readdirSync(E2E_DIR)
  .filter((f) => f.endsWith(".spec.ts"))
  .map((f) => read(join(E2E_DIR, f)) ?? "")
  .join("\n");

/** Storybook slug for a component: `title` slug + export name slug. */
const storySlug = (name) => kebab(name);

const components = [];
for (const dirName of readdirSync(COMPONENTS_DIR)) {
  const dir = join(COMPONENTS_DIR, dirName);
  if (!statSync(dir).isDirectory()) continue;

  const tsx = read(join(dir, `${dirName}.tsx`));
  const css = read(join(dir, `${dirName}.css`));
  const stories = read(join(dir, `${dirName}.stories.tsx`));
  const tests = read(join(dir, `${dirName}.test.tsx`));

  const findings = [];
  const file = (ok, label) => {
    if (!ok) findings.push({ severity: "BLOCKER", category: "files", label });
  };

  file(tsx !== null, `missing ${dirName}.tsx`);
  file(stories !== null, `missing ${dirName}.stories.tsx`);
  file(tests !== null, `missing ${dirName}.test.tsx`);

  // --- CSS ownership -----------------------------------------------------
  let cssOwner = "own";
  if (!css) {
    if (CSS_SHARES[dirName]) cssOwner = `shared:${CSS_SHARES[dirName].join(",")}`;
    else if (NO_CSS_BY_DESIGN.includes(dirName)) cssOwner = "none";
    else {
      cssOwner = "MISSING";
      findings.push({ severity: "BLOCKER", category: "css", label: "no stylesheet and no documented share" });
    }
  }

  // --- styles.css registration -----------------------------------------
  if (css) {
    const registered = stylesCss.includes(`./components/${dirName}/${dirName}.css`);
    if (!registered) {
      findings.push({
        severity: "BLOCKER",
        category: "css",
        label: `${dirName}.css is not imported by src/styles.css`,
      });
    }
  }

  // --- public export -----------------------------------------------------
  const exported = new RegExp(`export\\s*\\{[^}]*\\b${dirName}\\b`, "s").test(indexTs);
  if (!exported) {
    findings.push({ severity: "BLOCKER", category: "export", label: `${dirName} is not exported from src/index.ts` });
  }

  // --- class naming ------------------------------------------------------
  const expectedPrefix = `.b4-${kebab(dirName)}`;
  if (css && !css.includes(expectedPrefix)) {
    findings.push({
      severity: "WARN",
      category: "naming",
      label: `stylesheet has no ${expectedPrefix} selector (expected class prefix b4-${kebab(dirName)})`,
    });
  }
  if (tsx && !tsx.includes(`b4-${kebab(dirName)}`)) {
    findings.push({
      severity: "WARN",
      category: "naming",
      label: `component renders no b4-${kebab(dirName)} class`,
    });
  }

  // --- hardcoded colors --------------------------------------------------
  for (const c of findColorLiterals(css ?? "")) {
    findings.push({
      severity: "BLOCKER",
      category: "color",
      label: `hardcoded ${c.kind} color "${c.value}" in ${dirName}.css:${c.line}`,
    });
  }

  // --- unresolved tokens -------------------------------------------------
  for (const t of findUnresolvedTokens(css ?? "", tsx)) {
    findings.push({
      severity: "BLOCKER",
      category: "token",
      label: `var(${t.name}) in ${dirName}.css:${t.line} resolves to nothing (not a token, not local, not set inline)`,
    });
  }

  // --- stories -----------------------------------------------------------
  if (stories) {
    if (!/tags:\s*\[\s*["']autodocs["']\s*\]/.test(stories)) {
      findings.push({ severity: "BLOCKER", category: "stories", label: `stories are not tagged autodocs` });
    }
    if (!/argTypes/.test(stories)) {
      findings.push({
        severity: "WARN",
        category: "stories",
        label: `stories declare no argTypes (no per-variant controls)`,
      });
    }
    if (!/export const (All|Overview|Variants|Sizes)/.test(stories)) {
      findings.push({
        severity: "WARN",
        category: "stories",
        label: `stories have no "all variants"/"all sizes" overview story`,
      });
    }
  }

  // --- tests -------------------------------------------------------------
  if (tests) {
    if (!/toHaveNoViolations/.test(tests)) {
      findings.push({ severity: "BLOCKER", category: "tests", label: `tests never assert axe has no violations` });
    }
    if (!/from "jest-axe"/.test(tests)) {
      findings.push({ severity: "WARN", category: "tests", label: `tests do not import jest-axe` });
    }
  }

  // --- forwardRef --------------------------------------------------------
  if (tsx && !/forwardRef/.test(tsx)) {
    findings.push({
      severity: "WARN",
      category: "api",
      label: `component does not use forwardRef`,
    });
  }

  // --- reduced motion ----------------------------------------------------
  const hasCssMotion = css && /(animation\s*:|transition\s*:)/.test(stripCssComments(css));
  const hasJsMotion = tsx && /from "motion\/react"/.test(tsx);
  const respectsReducedMotion =
    (tsx && /useReducedMotion/.test(tsx)) ||
    (css && /prefers-reduced-motion/.test(css)) ||
    (css && /--b4-motion-scale/.test(css));
  if ((hasCssMotion || hasJsMotion) && !respectsReducedMotion) {
    findings.push({
      severity: "BLOCKER",
      category: "motion",
      label: `animates but never checks reduced motion`,
    });
  }

  // --- e2e coverage ------------------------------------------------------
  const slug = storySlug(dirName);
  const hasE2e = e2eText.includes(slug) || e2eText.includes(dirName);
  if (!hasE2e) {
    findings.push({
      severity: "WARN",
      category: "e2e",
      label: `no Playwright spec references this component`,
    });
  }

  components.push({
    name: dirName,
    kebab: kebab(dirName),
    cssOwner,
    hasOwnCss: !!css,
    findings,
  });
}

/* -------------------------------------------------------------- effects */

const effects = [];
if (statSync(EFFECTS_DIR).isDirectory()) {
  for (const dirName of readdirSync(EFFECTS_DIR)) {
    const dir = join(EFFECTS_DIR, dirName);
    if (!statSync(dir).isDirectory()) continue;
    const tsx = read(join(dir, `${dirName}.tsx`));
    const css = read(join(dir, `${dirName}.css`));
    const stories = read(join(dir, `${dirName}.stories.tsx`));
    const tests = read(join(dir, `${dirName}.test.tsx`));
    const findings = [];
    if (!tsx) findings.push({ severity: "BLOCKER", category: "files", label: `missing ${dirName}.tsx` });
    if (!css) findings.push({ severity: "BLOCKER", category: "files", label: `missing ${dirName}.css` });
    if (!stories) findings.push({ severity: "BLOCKER", category: "files", label: `missing ${dirName}.stories.tsx` });
    if (!tests) findings.push({ severity: "BLOCKER", category: "files", label: `missing ${dirName}.test.tsx` });
    if (css && !stylesCss.includes(`./effects/${dirName}/${dirName}.css`)) {
      findings.push({ severity: "BLOCKER", category: "css", label: `${dirName}.css is not imported by src/styles.css` });
    }
    for (const c of findColorLiterals(css ?? "")) {
      findings.push({ severity: "BLOCKER", category: "color", label: `hardcoded ${c.kind} color "${c.value}" in ${dirName}.css:${c.line}` });
    }
    for (const t of findUnresolvedTokens(css ?? "", tsx)) {
      findings.push({ severity: "BLOCKER", category: "token", label: `var(${t.name}) in ${dirName}.css:${t.line} resolves to nothing` });
    }
    if (stories && !/tags:\s*\[\s*["']autodocs["']\s*\]/.test(stories)) {
      findings.push({ severity: "BLOCKER", category: "stories", label: `stories are not tagged autodocs` });
    }
    if (tests && !/toHaveNoViolations/.test(tests)) {
      findings.push({ severity: "BLOCKER", category: "tests", label: `tests never assert axe has no violations` });
    }
    const effectsIndex = read(join(EFFECTS_DIR, "index.ts")) ?? "";
    if (!new RegExp(`\\b${dirName}\\b`).test(effectsIndex)) {
      findings.push({ severity: "BLOCKER", category: "export", label: `${dirName} is not exported from effects/index.ts` });
    }
    effects.push({ name: dirName, findings });
  }
}

/* ------------------------------------------- documented share enforcement */

const shareFindings = [];
for (const [component, owners] of Object.entries(CSS_SHARES)) {
  for (const owner of owners) {
    const documented = inventory.includes(`${component}`) && inventory.includes(owner);
    if (!documented) {
      shareFindings.push({
        severity: "BLOCKER",
        category: "css",
        label: `CSS share ${component} -> ${owner} is not documented in COMPONENT_INVENTORY.md`,
      });
    }
  }
}

/* ------------------------------------------------------------ hard rule */

const blipmadeHits = [];
for (const file of readdirSync(ROOT)) {
  const p = join(ROOT, file);
  if (!statSync(p).isFile()) continue;
  if (!/\.(ts|tsx|css|md|json|mjs|yml|yaml)$/.test(file)) continue;
  const content = read(p) ?? "";
  if (/blipmade/i.test(content)) blipmadeHits.push(file);
}

/* --------------------------------------------------------------- report */

const all = [
  ...components.flatMap((c) => c.findings.map((f) => ({ ...f, subject: c.name }))),
  ...effects.flatMap((c) => c.findings.map((f) => ({ ...f, subject: `effects/${c.name}` }))),
  ...shareFindings.map((f) => ({ ...f, subject: "COMPONENT_INVENTORY.md" })),
];
const blockers = all.filter((f) => f.severity === "BLOCKER");
const warns = all.filter((f) => f.severity === "WARN");

const byCategory = new Map();
for (const f of all) {
  if (!byCategory.has(f.category)) byCategory.set(f.category, []);
  byCategory.get(f.category).push(f);
}

const clean = components.filter((c) => c.findings.length === 0).map((c) => c.name);

const lines = [];
lines.push(`# B4 — Craftsmanship Audit`);
lines.push("");
lines.push(`Generated by \`scripts/craftsmanship-audit.mjs\` — a systematic, re-runnable`);
lines.push(`sweep over every component in \`packages/react/src/components\` and the`);
lines.push(`effects entry point. Re-run it with \`npm run audit:craftsmanship\`; it`);
lines.push(`exits non-zero on any BLOCKER, so it can gate CI.`);
lines.push("");
lines.push(`## Summary`);
lines.push("");
lines.push(`| Metric | Count |`);
lines.push(`|---|---|`);
lines.push(`| Components audited | ${components.length} |`);
lines.push(`| Effects audited | ${effects.length} |`);
lines.push(`| BLOCKER findings | ${blockers.length} |`);
lines.push(`| WARN findings | ${warns.length} |`);
lines.push(`| Components with zero findings | ${clean.length} |`);
lines.push(`| Blipmade references | ${blipmadeHits.length} |`);
lines.push("");

lines.push(`## Checks performed`);
lines.push("");
lines.push(`| # | Check | Category |`);
lines.push(`|---|---|---|`);
lines.push(`| 1 | Full file set present (component, CSS, stories, tests) | files |`);
lines.push(`| 2 | CSS ownership is explicit (own sheet / documented share / none by design) | css |`);
lines.push(`| 3 | Owned stylesheets are registered in \`src/styles.css\` | css |`);
lines.push(`| 4 | Component is exported from \`src/index.ts\` | export |`);
lines.push(`| 5 | Class naming follows \`b4-<kebab>\` | naming |`);
lines.push(`| 6 | No hardcoded color literals in component CSS | color |`);
lines.push(`| 7 | Every \`var(--b4-*)\` actually resolves | token |`);
lines.push(`| 8 | Stories are autodocs-tagged with controls and an overview | stories |`);
lines.push(`| 9 | Tests assert zero axe violations | tests |`);
lines.push(`| 10 | Animated components respect reduced motion | motion |`);
lines.push(`| 11 | A Playwright spec references the component | e2e |`);
lines.push(`| 12 | No Blipmade references anywhere (hard rule) | hard-rule |`);
lines.push("");

if (blockers.length) {
  lines.push(`## BLOCKERS (${blockers.length})`);
  lines.push("");
  lines.push(`| Component | Category | Finding |`);
  lines.push(`|---|---|---|`);
  for (const f of blockers) lines.push(`| ${f.subject} | ${f.category} | ${f.label} |`);
  lines.push("");
} else {
  lines.push(`## BLOCKERS (0)`);
  lines.push("");
  lines.push(`None.`);
  lines.push("");
}

if (warns.length) {
  lines.push(`## Warnings (${warns.length})`);
  lines.push("");
  lines.push(`| Component | Category | Finding |`);
  lines.push(`|---|---|---|`);
  for (const f of warns) lines.push(`| ${f.subject} | ${f.category} | ${f.label} |`);
  lines.push("");
}

lines.push(`## Per-component detail`);
lines.push("");
lines.push(`| Component | CSS | Blockers | Warnings |`);
lines.push(`|---|---|---|---|`);
for (const c of components) {
  const b = c.findings.filter((f) => f.severity === "BLOCKER").length;
  const w = c.findings.filter((f) => f.severity === "WARN").length;
  lines.push(`| ${c.name} | ${c.cssOwner} | ${b} | ${w} |`);
}
lines.push("");

const report = lines.join("\n");
writeFileSync(join(ROOT, "CRAFTMANSHIP_AUDIT.md"), report, "utf8");

console.log(`Craftsmanship audit: ${components.length} components, ${effects.length} effects`);
console.log(`  BLOCKERS: ${blockers.length}`);
console.log(`  WARNINGS: ${warns.length}`);
console.log(`  Clean components: ${clean.length}`);
console.log(`  Blipmade references: ${blipmadeHits.length}`);
console.log(`  Report: CRAFTMANSHIP_AUDIT.md`);
if (blockers.length) {
  console.log("");
  for (const f of blockers) console.log(`  BLOCKER ${f.subject}: ${f.label}`);
}
process.exit(blockers.length ? 1 : 0);
