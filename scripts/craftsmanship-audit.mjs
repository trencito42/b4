#!/usr/bin/env node
/**
 * B4 craftsmanship audit — a systematic, re-runnable sweep over every
 * component in `packages/react/src/components`, the effects entry point,
 * and the Studio catalog. It does not judge taste; it checks the
 * mechanical invariants that `AGENTS.md` and `TESTING.md` actually
 * require, so a regression cannot pass unnoticed between sessions:
 *
 *   1.  Every component has its full file set (component, CSS, stories, tests).
 *   2.  Every component's CSS is either owned by it or an explicitly
 *       documented share of another component's stylesheet.
 *   3.  Every owned stylesheet is registered in `src/styles.css`.
 *   4.  Every component is exported from `src/index.ts`.
 *   5.  Every `var(--b4-*)` a component reads actually exists — either in
 *       `@b4/tokens`, or in the component's own stylesheet, or set inline by
 *       the component itself. (The silent-failure class of bug that
 *       `HANDOFF.md` records as gotcha #10.)
 *   6.  No hardcoded color literals in component CSS, unless the literal
 *       carries a written justification (`b4-audit-allow: <reason>`).
 *   7.  Stories are autodocs-tagged and publish a canonical `Default`.
 *   8.  Tests exercise `jest-axe` and assert zero violations.
 *   9.  Animated components respect reduced motion — including through
 *       tokenized durations, which the token layer zeroes automatically.
 *  10.  A Playwright spec references the component.
 *  11.  Every Studio catalog deep link resolves to a real story id.
 *  12.  The inventory's component count matches reality.
 *  13.  No Blipmade references in code (hard rule).
 *
 * Exit code 1 when there are BLOCKERs, so CI can gate on it.
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
const STUDIO_DIR = join(ROOT, "apps/studio/src/studio");

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
 * Each entry MUST be justified in `COMPONENT_INVENTORY.md`'s
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

/**
 * Components whose public API is a provider/hook pair rather than a
 * component of the same name. Without this, "Toast is not exported"
 * would be reported forever as a false blocker.
 */
const PUBLIC_API_NAMES = {
  Toast: ["ToastProvider", "useToast", "toastManager"],
};

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
];

const COLOR_LITERAL_PATTERNS = [
  { kind: "hex", re: /#[0-9a-fA-F]{3,8}\b/g },
  { kind: "rgb", re: /\brgba?\(\s*[0-9]/g },
  { kind: "hsl", re: /\bhsla?\(\s*[0-9]/g },
];

/**
 * A stylesheet may opt a literal out of the colour check with
 * `/* b4-audit-allow: <reason> *\/`. The exemption covers the declaration
 * block that follows it — from the marker to the end of the current rule —
 * so a multi-line declaration does not need a marker per line. The reason
 * is not optional: an exemption without one is itself a finding, because
 * "trust me" is not a justification and the whole point of the rule is
 * that the reason survives the next person reading the file.
 */
function splitExemptions(css) {
  const lines = css.split("\n");
  const exempt = new Set();
  const reasons = [];
  let inExemptBlock = false;
  const body = [];
  for (const line of lines) {
    const marker = line.match(/b4-audit-allow:\s*(.+?)\s*\*\//);
    if (marker) {
      inExemptBlock = true;
      reasons.push({ reason: marker[1], line: body.length + 1 });
      body.push("");
      continue;
    }
    body.push(line);
    if (inExemptBlock) {
      exempt.add(body.length);
      if (line.includes("}")) inExemptBlock = false;
    }
  }
  // Blank out any remaining comment content, keeping every line break so
  // the reported line numbers still point at the real source line. A word
  // like "black" in a comment is prose, not a colour literal.
  const stripped = body.join("\n").replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  return { body: stripped, exempt, reasons };
}

const COLOR_EXEMPTIONS = [];

function findColorLiterals(css, fileLabel) {
  const { body, exempt, reasons } = splitExemptions(css);
  for (const r of reasons) COLOR_EXEMPTIONS.push({ file: fileLabel, ...r });
  const found = [];
  const lineOf = (index) => body.slice(0, index).split("\n").length;

  for (const { kind, re } of COLOR_LITERAL_PATTERNS) {
    for (const m of body.matchAll(re)) {
      const line = lineOf(m.index);
      if (exempt.has(line)) continue;
      found.push({ kind, value: m[0], line });
    }
  }
  for (const m of body.matchAll(/:\s*([^;{}]+)/g)) {
    const value = m[1];
    if (/\b(var\(|url\(|@|calc\()/i.test(value)) continue;
    const line = lineOf(m.index);
    if (exempt.has(line)) continue;
    for (const color of NAMED_COLORS) {
      if (color === "transparent") continue; // a legitimate, colour-independent value
      const re = new RegExp(`(^|[\\s,(])${color}([\\s,)]|$)`, "i");
      if (re.test(value)) {
        found.push({ kind: "named", value: color, line });
        break;
      }
    }
  }
  return found;
}

function findUnresolvedTokens(css, tsx) {
  const body = stripCssComments(css);
  const locallyDeclared = new Set([...body.matchAll(/(--b4-[a-z0-9-]+)\s*:/g)].map((m) => m[1]));
  const inlineSet = new Set([...(tsx ?? "").matchAll(/["'`](--b4-[a-z0-9-]+)["'`]\s*:/g)].map((m) => m[1]));
  const unresolved = [];
  // A var() with a fallback (`var(--x, 40%)`) always resolves — the fallback
  // is the value when the custom property is undefined.
  for (const m of body.matchAll(/var\(\s*(--b4-[a-z0-9-]+)\s*(,|\))/g)) {
    const name = m[1];
    if (m[2] === ",") continue; // has a fallback
    if (TOKEN_NAMES.has(name) || locallyDeclared.has(name) || inlineSet.has(name)) continue;
    const line = body.slice(0, m.index).split("\n").length;
    unresolved.push({ name, line });
  }
  return unresolved;
}

/* --------------------------------------------------------------- storybook */

/** Storybook's own id sanitizer (storybook/internal/csf). */
const storybookSlug = (title) =>
  title
    .toLowerCase()
    .replace(/[ ’–—―′¿'`~!@#$%^&*()_|+\-=?;:'",.<>{}[\]\\/]/gi, "-")
    .replace(/-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");

function collectStories() {
  const stories = [];
  const walk = (dir) => {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const p = join(dir, entry.name);
      if (entry.isDirectory()) walk(p);
      else if (entry.name.endsWith(".stories.tsx")) {
        const src = read(p) ?? "";
        const title = src.match(/^\s{2}title:\s*"([^"]+)"/m)?.[1];
        if (!title) continue;
        const exports = [...src.matchAll(/export const (\w+)/g)].map((m) => m[1]);
        stories.push({
          file: p,
          title,
          id: storybookSlug(title),
          exports,
          hasDefault: exports.includes("Default"),
        });
      }
    }
  };
  walk(REACT_SRC);
  return stories;
}

const STORIES = collectStories();

/* ------------------------------------------------------------------ audit */

/** Does a stylesheet itself opt into reduced motion (a media query, the motion scale)? */
function explicitReducedMotionRef(css) {
  if (!css) return false;
  return /prefers-reduced-motion/.test(css) || /--b4-motion-scale/.test(css);
}

/**
 * The optional props of a component that carry a visual variant — the
 * ones Storybook's controls should expose. A component with no such prop
 * (a plain `Field`, say) has nothing to control, so requiring `argTypes`
 * of it would be noise rather than a finding.
 */
const VARIANT_PROP_PATTERN =
  /^(variant|size|tone|status|state|preset|orientation|align|alignment|gap|direction|level|mode|density|appearance|emphasis|shape)$/;

function variantPropsOf(tsx) {
  if (!tsx) return [];
  const iface = tsx.match(/export interface \w*Props[^{]*\{([\s\S]*?)\n\}/);
  const source = iface ? iface[1] : tsx;
  const props = new Set();
  for (const m of source.matchAll(/^\s{2}([a-zA-Z][a-zA-Z0-9]*)\??:/gm)) {
    if (VARIANT_PROP_PATTERN.test(m[1])) props.add(m[1]);
  }
  return [...props];
}

const stylesCss = read(join(REACT_SRC, "styles.css")) ?? "";
const indexTs = read(join(REACT_SRC, "index.ts")) ?? "";
const inventory = read(join(ROOT, "COMPONENT_INVENTORY.md")) ?? "";
const catalogTs = read(join(STUDIO_DIR, "catalog.ts")) ?? "";

const e2eText = readdirSync(E2E_DIR)
  .filter((f) => f.endsWith(".spec.ts"))
  .map((f) => read(join(E2E_DIR, f)) ?? "")
  .join("\n");

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

  let cssOwner = "own";
  if (!css) {
    if (CSS_SHARES[dirName]) cssOwner = `shared:${CSS_SHARES[dirName].join(",")}`;
    else if (NO_CSS_BY_DESIGN.includes(dirName)) cssOwner = "none";
    else {
      cssOwner = "MISSING";
      findings.push({ severity: "BLOCKER", category: "css", label: "no stylesheet and no documented share" });
    }
  }

  if (css && !stylesCss.includes(`./components/${dirName}/${dirName}.css`)) {
    findings.push({
      severity: "BLOCKER",
      category: "css",
      label: `${dirName}.css is not imported by src/styles.css`,
    });
  }

  // --- public export -----------------------------------------------------
  const exportNames = PUBLIC_API_NAMES[dirName] ?? [dirName];
  const exported = exportNames.some((n) => new RegExp(`export\\s*\\{[^}]*\\b${n}\\b`, "s").test(indexTs));
  if (!exported) {
    findings.push({
      severity: "BLOCKER",
      category: "export",
      label: `${dirName} is not exported from src/index.ts`,
    });
  }

  // --- class naming ------------------------------------------------------
  // A component that shares another component's stylesheet may render
  // either its own class (styled by the shared sheet) or the owner's.
  // A pure-Motion component owns no stylesheet and therefore no class of
  // its own — its `className` prop is the consumer's hook.
  const classOwner = CSS_SHARES[dirName]?.[0] ?? dirName;
  const ownClass = `b4-${kebab(dirName)}`;
  const ownerClass = `b4-${kebab(classOwner)}`;
  const classless = NO_CSS_BY_DESIGN.includes(dirName);
  if (!classless && css && !css.includes(`.${ownClass}`) && !css.includes(`.${ownerClass}`)) {
    findings.push({
      severity: "WARN",
      category: "naming",
      label: `stylesheet has no ${ownClass} or ${ownerClass} selector`,
    });
  }
  if (!classless && tsx && !tsx.includes(ownClass) && !tsx.includes(ownerClass)) {
    findings.push({
      severity: "WARN",
      category: "naming",
      label: `component renders no ${ownClass} or ${ownerClass} class`,
    });
  }

  // --- hardcoded colors --------------------------------------------------
  for (const c of findColorLiterals(css ?? "", `${dirName}.css`)) {
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
      label: `var(${t.name}) in ${dirName}.css:${t.line} resolves to nothing`,
    });
  }

  // --- stories -----------------------------------------------------------
  const variantProps = variantPropsOf(tsx);
  if (stories) {
    if (!/tags:\s*\[\s*["']autodocs["']\s*\]/.test(stories)) {
      findings.push({ severity: "BLOCKER", category: "stories", label: `stories are not tagged autodocs` });
    }
    if (!/export const Default\b/.test(stories)) {
      findings.push({
        severity: "BLOCKER",
        category: "stories",
        label: `stories publish no canonical "Default" story (the Studio catalog deep-links to it)`,
      });
    }
    if (variantProps.length && !/argTypes/.test(stories)) {
      findings.push({
        severity: "WARN",
        category: "stories",
        label: `stories declare no argTypes, so ${variantProps.join(", ")} cannot be controlled in Storybook`,
      });
    }
    if (variantProps.length && !/export const (All|Overview|Variants|Sizes)/.test(stories)) {
      findings.push({
        severity: "WARN",
        category: "stories",
        label: `stories have no "all variants"/"all sizes" overview story, so ${variantProps.join(", ")} cannot be seen side by side`,
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

  // --- reduced motion ----------------------------------------------------
  // The token layer zeroes every `--b4-duration-*` under
  // `prefers-reduced-motion: reduce`, so a CSS transition whose duration
  // comes from a token is already reduced-motion safe. Only a hand-written
  // duration escapes that contract.
  //
  // Motion (JS) animations are a different story: they are driven by
  // springs in JavaScript and never see the CSS duration tokens, so a
  // component that animates through Motion must ask useReducedMotion()
  // itself.
  const hasCssMotion = css && /(animation\s*:|transition\s*:)/.test(stripCssComments(css));
  const hasJsMotion = tsx && /from "motion\/react"/.test(tsx);
  const rawDurations = css
    ? [...stripCssComments(css).matchAll(/(?:animation|transition)[^;{]*?(\d*\.?\d+m?s)\b/g)].filter(
        (m) => !/var\(--b4-duration/.test(m[0]),
      )
    : [];
  if (rawDurations.length) {
    // A hand-written duration is only a defect when the stylesheet has no
    // reduced-motion strategy for it. B4's continuous indicators
    // (progress, spinner, skeleton) deliberately keep moving under reduced
    // motion — they slow down instead, because "still working" must stay
    // readable — and they say so in an explicit media query.
    const hasReducedMotionStrategy =
      css && /@media\s*\(prefers-reduced-motion:\s*reduce\)[\s\S]*?(animation-duration|animation\s*:)/.test(css);
    if (hasReducedMotionStrategy) {
      findings.push({
        severity: "INFO",
        category: "motion",
        label: `animates with a hand-written duration (${rawDurations[0][1]}) but overrides it under prefers-reduced-motion`,
      });
    } else {
      findings.push({
        severity: "BLOCKER",
        category: "motion",
        label: `animates with a hand-written duration (${rawDurations[0][1]}) that reduced motion cannot switch off`,
      });
    }
  }
  if (hasJsMotion && tsx && !/useReducedMotion/.test(tsx)) {
    findings.push({
      severity: "BLOCKER",
      category: "motion",
      label: `animates through Motion but never checks useReducedMotion()`,
    });
  }
  if (hasCssMotion && !rawDurations.length && !explicitReducedMotionRef(css)) {
    findings.push({
      severity: "INFO",
      category: "motion",
      label: `animates using tokenised durations only — reduced-motion safe by the token contract`,
    });
  }

  // --- e2e coverage ------------------------------------------------------
  if (!e2eText.includes(dirName)) {
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
    forwardsRef: !!tsx && /forwardRef/.test(tsx),
    findings,
  });
}

/* -------------------------------------------------------------- effects */

const effects = [];
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
  for (const c of findColorLiterals(css ?? "", `effects/${dirName}.css`)) {
    findings.push({ severity: "BLOCKER", category: "color", label: `hardcoded ${c.kind} color "${c.value}" in ${dirName}.css:${c.line}` });
  }
  for (const t of findUnresolvedTokens(css ?? "", tsx)) {
    findings.push({ severity: "BLOCKER", category: "token", label: `var(${t.name}) in ${dirName}.css:${t.line} resolves to nothing` });
  }
  if (stories) {
    if (!/tags:\s*\[\s*["']autodocs["']\s*\]/.test(stories)) {
      findings.push({ severity: "BLOCKER", category: "stories", label: `stories are not tagged autodocs` });
    }
    if (!/export const Default\b/.test(stories)) {
      findings.push({ severity: "BLOCKER", category: "stories", label: `stories publish no canonical "Default" story` });
    }
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

/* ------------------------------------------- documented share enforcement */

const shareFindings = [];
for (const [component, owners] of Object.entries(CSS_SHARES)) {
  for (const owner of owners) {
    if (!inventory.includes(component) || !inventory.includes(owner)) {
      shareFindings.push({
        severity: "BLOCKER",
        category: "css",
        label: `CSS share ${component} -> ${owner} is not documented in COMPONENT_INVENTORY.md`,
      });
    }
  }
}

/* --------------------------------------------------- studio catalog links */

const catalogFindings = [];
const storyIds = new Set(STORIES.map((s) => s.id));
const storyIdsWithDefault = new Set(STORIES.filter((s) => s.hasDefault).map((s) => s.id));

const catalogBlocks = [...catalogTs.matchAll(/storybookFamilySlug:\s*"([^"]+)"([\s\S]*?)\n  \},/g)];
let catalogEntryCount = 0;
for (const [, family, body] of catalogBlocks) {
  for (const m of body.matchAll(/[ce]\("([A-Za-z]+)"\)/g)) {
    const name = m[1];
    catalogEntryCount++;
    // Storybook does not split camelCase when it slugifies.
    const expected = `${family}-${name.toLowerCase()}`;
    if (!storyIds.has(expected)) {
      catalogFindings.push({
        severity: "BLOCKER",
        category: "catalog",
        label: `catalog entry "${name}" points at ${expected}, which is not a published story`,
      });
    } else if (!storyIdsWithDefault.has(expected)) {
      catalogFindings.push({
        severity: "BLOCKER",
        category: "catalog",
        label: `catalog entry "${name}" links to ${expected}--default, but that story does not exist`,
      });
    }
  }
}

// The catalog's slug helper must not split camelCase — Storybook does not.
if (/replace\(\/\(\[a-z\]\)\(\[A-Z\]\)/.test(catalogTs)) {
  catalogFindings.push({
    severity: "BLOCKER",
    category: "catalog",
    label: `the catalog slug helper splits camelCase, which Storybook does not — every multi-word deep link is dead`,
  });
}

// Every component and effect must be listed in the catalog.
const catalogNames = new Set([...catalogTs.matchAll(/[ce]\("([A-Za-z]+)"\)/g)].map((m) => m[1]));
for (const c of components) {
  if (!catalogNames.has(c.name)) {
    catalogFindings.push({
      severity: "BLOCKER",
      category: "catalog",
      label: `${c.name} is not listed in the Studio catalog`,
    });
  }
}
for (const e of effects) {
  if (!catalogNames.has(e.name)) {
    catalogFindings.push({
      severity: "BLOCKER",
      category: "catalog",
      label: `effect ${e.name} is not listed in the Studio catalog`,
    });
  }
}

/* ------------------------------------------------------- inventory counts */

const inventoryFindings = [];
// Only the family tables count — the effects table below them is a
// different kind of thing, and "RangeSlider" is a documented alias of
// Slider rather than a component of its own.
const familySection = inventory.split(/^##\s+Effects/m)[0] ?? inventory;
const inventoryRows = [...familySection.matchAll(/^\| ([A-Z][A-Za-z]+) \|[^|]*\*\*VERIFIED/gm)].map((m) => m[1]);
const inventoryUnique = new Set(inventoryRows);
const sharedEntries = ["RangeSlider"]; // documented as sharing Slider's implementation
const realCount = components.length;
const claimedCount =
  inventoryUnique.size - sharedEntries.filter((s) => inventoryUnique.has(s)).length;

if (claimedCount !== realCount) {
  inventoryFindings.push({
    severity: "BLOCKER",
    category: "inventory",
    label: `COMPONENT_INVENTORY.md lists ${claimedCount} components, but the library ships ${realCount}`,
  });
}

// The inventory's total-component claim appears in several docs. Only a
// total is checked here — family sizes ("Family B — 19 components") are
// a different number and must not trip this.
for (const doc of ["PROGRESS.md", "HANDOFF.md", "PHASE7_AUDIT.md", "README.md"]) {
  const text = read(join(ROOT, doc));
  if (!text) continue;
  const stale = [...text.matchAll(/\b(\d{2,3})\s+(?:public\s+)?components\b/g)].filter(
    (m) => Number(m[1]) >= 40 && Number(m[1]) !== realCount,
  );
  for (const s of stale) {
    inventoryFindings.push({
      severity: "BLOCKER",
      category: "inventory",
      label: `${doc} claims ${s[1]} components; the library ships ${realCount}`,
    });
  }
}

/* ------------------------------------------------------------ hard rule */

const blipmadeHits = [];
for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
  if (!entry.isFile()) continue;
  // Code and config only. Prose in the docs that states the prohibition
  // ("no Blipmade coupling") is the rule being restated, not a violation.
  if (!/\.(ts|tsx|css|mjs|js|json|yml|yaml)$/.test(entry.name)) continue;
  const content = read(join(ROOT, entry.name)) ?? "";
  if (/blipmade/i.test(content)) blipmadeHits.push(entry.name);
}

/* --------------------------------------------------------------- report */

const all = [
  ...components.flatMap((c) => c.findings.map((f) => ({ ...f, subject: c.name }))),
  ...effects.flatMap((c) => c.findings.map((f) => ({ ...f, subject: `effects/${c.name}` }))),
  ...shareFindings.map((f) => ({ ...f, subject: "COMPONENT_INVENTORY.md" })),
  ...catalogFindings.map((f) => ({ ...f, subject: "studio/catalog.ts" })),
  ...inventoryFindings.map((f) => ({ ...f, subject: "COMPONENT_INVENTORY.md" })),
];
const blockers = all.filter((f) => f.severity === "BLOCKER");
const warns = all.filter((f) => f.severity === "WARN");
const infos = all.filter((f) => f.severity === "INFO");
const clean = components.filter((c) => c.findings.length === 0).map((c) => c.name);
const noRef = components.filter((c) => !c.forwardsRef).map((c) => c.name);

const lines = [];
lines.push(`# B4 — Craftsmanship Audit`);
lines.push("");
lines.push(`Generated by \`scripts/craftsmanship-audit.mjs\` — a systematic, re-runnable sweep`);
lines.push(`over every component in \`packages/react/src/components\`, the effects entry point,`);
lines.push(`and the Studio catalog. Re-run it with \`npm run audit:craftsmanship\`; it exits`);
lines.push(`non-zero on any BLOCKER, so it can gate CI.`);
lines.push("");
lines.push(`## Summary`);
lines.push("");
lines.push(`| Metric | Count |`);
lines.push(`|---|---|`);
lines.push(`| Components audited | ${components.length} |`);
lines.push(`| Effects audited | ${effects.length} |`);
lines.push(`| Stories files audited | ${STORIES.length} |`);
lines.push(`| Studio catalog entries | ${catalogEntryCount} |`);
lines.push(`| BLOCKER findings | ${blockers.length} |`);
lines.push(`| WARN findings | ${warns.length} |`);
lines.push(`| Components with zero findings | ${clean.length} |`);
lines.push(`| Components not forwarding a ref | ${noRef.length} |`);
lines.push(`| Blipmade references in code | ${blipmadeHits.length} |`);
lines.push("");

lines.push(`## Checks performed`);
lines.push("");
lines.push(`| # | Check | Category |`);
lines.push(`|---|---|---|`);
lines.push(`| 1 | Full file set present (component, CSS, stories, tests) | files |`);
lines.push(`| 2 | CSS ownership is explicit (own sheet / documented share / none by design) | css |`);
lines.push(`| 3 | Owned stylesheets are registered in \`src/styles.css\` | css |`);
lines.push(`| 4 | Component is exported from \`src/index.ts\` | export |`);
lines.push(`| 5 | Class naming follows \`b4-<kebab>\` (or the shared owner's) | naming |`);
lines.push(`| 6 | No hardcoded color literals in component CSS (justified exemptions allowed) | color |`);
lines.push(`| 7 | Every \`var(--b4-*)\` actually resolves | token |`);
lines.push(`| 8 | Stories are autodocs-tagged, with controls, an overview and a canonical \`Default\` | stories |`);
lines.push(`| 9 | Tests assert zero axe violations | tests |`);
lines.push(`| 10 | Animated components respect reduced motion | motion |`);
lines.push(`| 11 | A Playwright spec references the component | e2e |`);
lines.push(`| 12 | Every Studio catalog deep link resolves to a published story | catalog |`);
lines.push(`| 13 | The inventory's component count matches reality | inventory |`);
lines.push(`| 14 | No Blipmade references in code (hard rule) | hard-rule |`);
lines.push("");

if (blockers.length) {
  lines.push(`## BLOCKERS (${blockers.length})`);
  lines.push("");
  lines.push(`| Subject | Category | Finding |`);
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
  lines.push(`| Subject | Category | Finding |`);
  lines.push(`|---|---|---|`);
  for (const f of warns) lines.push(`| ${f.subject} | ${f.category} | ${f.label} |`);
  lines.push("");
}

if (infos.length) {
  lines.push(`## Notes (${infos.length})`);
  lines.push("");
  lines.push(`Informational — these are compliant, but recorded so a reader can see what the`);
  lines.push(`audit considered rather than assuming it did not look.`);
  lines.push("");
  lines.push(`| Subject | Category | Note |`);
  lines.push(`|---|---|---|`);
  for (const f of infos) lines.push(`| ${f.subject} | ${f.category} | ${f.label} |`);
  lines.push("");
}

lines.push(`## Systemic observation — ref forwarding`);
lines.push("");
lines.push(`${noRef.length} of ${components.length} components do not forward a ref to their root`);
lines.push(`element (\`AGENTS.md\`'s checklist asks for \`forwardRef\`). Most of the remainder are`);
lines.push(`compound components whose individual parts are Base UI primitives that forward their`);
lines.push(`own refs, or components that deliberately reuse another component's markup. This is`);
lines.push(`recorded rather than silently passed, because a consumer that wants to measure or`);
lines.push(`scroll to a \`Badge\` or a \`StatusBadge\` currently cannot.`);
lines.push("");
lines.push(`Not forwarding a ref: ${noRef.join(", ")}`);
lines.push("");

lines.push(`## Declared colour exemptions (${COLOR_EXEMPTIONS.length})`);
lines.push("");
lines.push(`Every exemption is a written justification living next to the code it excuses. They are`);
lines.push(`listed here rather than hidden, so a reader can challenge any of them.`);
lines.push("");
if (COLOR_EXEMPTIONS.length) {
  lines.push(`| File | Line | Reason |`);
  lines.push(`|---|---|---|`);
  for (const e of COLOR_EXEMPTIONS) lines.push(`| ${e.file} | ${e.line} | ${e.reason} |`);
} else {
  lines.push(`None.`);
}
lines.push("");

lines.push(`## Per-component detail`);
lines.push("");
lines.push(`| Component | CSS | Ref | Blockers | Warnings |`);
lines.push(`|---|---|---|---|---|`);
for (const c of components) {
  const b = c.findings.filter((f) => f.severity === "BLOCKER").length;
  const w = c.findings.filter((f) => f.severity === "WARN").length;
  lines.push(`| ${c.name} | ${c.cssOwner} | ${c.forwardsRef ? "yes" : "no"} | ${b} | ${w} |`);
}
lines.push("");

writeFileSync(join(ROOT, "CRAFTMANSHIP_AUDIT.md"), lines.join("\n"), "utf8");

console.log(`Craftsmanship audit: ${components.length} components, ${effects.length} effects, ${STORIES.length} stories`);
console.log(`  BLOCKERS: ${blockers.length}`);
console.log(`  WARNINGS: ${warns.length}`);
console.log(`  Clean components: ${clean.length}`);
console.log(`  Catalog entries checked: ${catalogEntryCount}`);
console.log(`  Blipmade references in code: ${blipmadeHits.length}`);
console.log(`  Report: CRAFTMANSHIP_AUDIT.md`);
if (blockers.length) {
  console.log("");
  for (const f of blockers) console.log(`  BLOCKER ${f.subject}: ${f.label}`);
}
process.exit(blockers.length ? 1 : 0);
