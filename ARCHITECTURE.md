# B4 — Architecture & Version Baseline

B4 is a standalone, commercially distributable React + TypeScript component
library and design system. This document records the technical foundation
and *why* each version/tool was chosen. It is a living document — update it
when the baseline changes, don't let it drift from `package.json` reality.

## Version research (done 2026-11-17, verified against the live npm registry, not memory)

Node.js and pnpm were **not installed on this machine** at the start of this
project. Installed via `winget install OpenJS.NodeJS.LTS` (authorized by the
user) and `npm install -g pnpm@latest`. Versions below were read with
`npm view <pkg> version` / `npm view <pkg> peerDependencies` against the live
registry on 2026-11-17 — not guessed from training data.

| Tool | Chosen version | Why |
|---|---|---|
| Node.js | 26.13.1 (LTS via winget) | Current LTS at time of setup. |
| pnpm | 12.21.0 | Current stable; workspaces for `packages/*` + `apps/*`. |
| React / react-dom | 19.3.1 | Current stable major; Base UI and Motion both target React 19. |
| TypeScript | **6.0.3**, NOT 7.0.2 | TS 7.0 is the new Go-native compiler (`tsc` rewritten in Go, ~10x faster) and is the registry's `latest` tag, but it **ships without a programmatic compiler API** (stable API promised for 7.1, still in dev as of this writing). `typescript-eslint@8.73.0` pins `peerDependencies.typescript: ">=4.8.4 <6.1.0"` — it does not yet support TS 7.x. Storybook's docgen and various Vite plugins also depend on the TS API. Picking 7.0 today would break linting and type-aware tooling across the whole stack. 6.0.3 is the last release on the classic JS compiler with full API support and total ecosystem compatibility. **Revisit this choice once `typescript-eslint` ships TS 7 support** — tracked in `HANDOFF.md`. |
| Vite | 8.3.8 | Current stable; Storybook 10's Vite builder targets Vite 8. |
| Vitest | 5.1.0 | Current stable; requires Node 22.12+ (satisfied) and Vite 6.4+ (satisfied). |
| @testing-library/react | 16.3.3 | Current stable, supports React 19. |
| @testing-library/jest-dom | 7.0.1 | Current stable. |
| @testing-library/user-event | 14.6.12 | Current stable. |
| jsdom | 31.0.1 | Current stable, Vitest's DOM environment. |
| Storybook / @storybook/react-vite | 10.6.7 | Current stable. **Do not install `@storybook/addon-essentials`** — deprecated and unpublished since Storybook 9 (empty package); Controls/Actions/Viewport/Interactions/Docs are now in core or in `@storybook/addon-docs`. |
| @storybook/addon-a11y | 10.6.7 | Current stable, matches core version; runs axe-core inside Storybook. |
| @storybook/addon-docs | 10.6.7 | Current stable; replaces the old essentials docs addon. |
| Playwright / @playwright/test | 1.65.1 | Current stable. |
| @axe-core/playwright | 4.14.0 | Current stable; versioned by the axe-core major.minor it bundles (not strict semver). |
| axe-core | 4.14.1 | Current stable (pulled in transitively too; pinned directly for unit-level checks). |
| jest-axe | 11.0.0 | Current stable; used with Vitest (`expect-axe`-style assertions) for component-level a11y checks outside Storybook/Playwright. |
| @base-ui/react | 1.9.0 | Current stable. **Renamed package** — the old name `@base-ui-components/react` is stale (early betas only); current installs must use `@base-ui/react`. Peer deps: `react`/`react-dom` `^17 \|\| ^18 \|\| ^19`. |
| motion | 14.14.0 | "Motion for React" — the renamed/rebuilt successor to Framer Motion. Import from `motion/react`, not `framer-motion`. Peer deps: `react`/`react-dom` `^18.0.0 \|\| ^19.0.0`. |
| eslint | 10.15.0 | Current stable (flat config). |
| typescript-eslint | 8.73.0 | Current stable; **pins the TypeScript ceiling to <6.1.0** (see above — this is the real reason TS stays on 6.0.3 for now). |
| prettier | 3.10.1 | Current stable. |
| tsup | 9.0.0 | Library bundler for `packages/react`, `packages/tokens`, `packages/motion` — ESM + CJS + `.d.ts`, tree-shakeable, SSR-safe output. |

## Workspace layout

```
b4/
  packages/
    tokens/   @b4/tokens  — design tokens: CSS custom properties (Graphite + Porcelain
                             themes), density/radius/accent/contrast/motion scales,
                             generated from a single TS source of truth.
    motion/   @b4/motion  — motion tokens (durations, easings, spring presets) and
                             shared Motion-for-React utilities (TextTransition engine,
                             layout/morph helpers, async state-transition helpers).
    react/    @b4/react   — the component library itself (Base UI primitives + B4
                             styling/behavior/motion). This is the package that ships.
  apps/
    studio/               — B4 Studio: Storybook-based interactive documentation/
                             showcase app, consumes @b4/react, @b4/tokens, @b4/motion
                             exactly as an external consumer would.
```

`@b4/*` is a **local placeholder scope** — not a reserved/verified npm
namespace. Do not publish without explicit user authorization (see
`RELEASE_CHECKLIST.md`).

## Why Base UI + Motion for React, not something else

- Base UI gives unstyled, accessible behavior (focus management, ARIA, keyboard
  interaction, collision-aware positioning) for primitives like Dialog, Popover,
  Menu, Select, Tabs, Slider, etc., so B4 doesn't have to re-solve WAI-ARIA from
  scratch — B4's job is the styling, motion, tokens and composition layer on top.
- Motion for React gives a production-grade animation engine (spring physics,
  layout animation, `AnimatePresence`, gesture support) that the motion system
  (see `MOTION_SPEC.md`) is built on, rather than hand-rolling CSS transitions
  for every stateful UI change.
- Both are React 19-first, headless/unstyled (Motion is layout-only, Base UI is
  behavior-only), which matches B4's goal of owning 100% of the visual language.

## Zero Blipmade coupling

B4 has no dependency, import, env var, API client, or brand reference pointing
at Blipmade anywhere in this repo. Sample data used in the three Studio
integration showcases (analytics, infra, billing) is clearly-labeled synthetic
data, not real Blipmade data or schemas.
