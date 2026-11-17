# B4 — Progress

Read this + `HANDOFF.md` + `git log`/`git status` before doing anything else
on resume. Don't re-plan from scratch — continue from what's actually here.

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 — Init, tokens/themes, motion foundations, Studio shell, docs infra | **DONE** | See below. |
| 1 — Motion foundation components (TextTransition, NumberTransition, AnimatedIndicator, SegmentedControl reference component) | **NOT STARTED** | `@b4/motion`'s tokens/useReducedMotion exist; the actual components don't. |
| 2 — Family A + B to full quality gate | **BARELY STARTED** | Only `Button` (Family A) exists and is VERIFIED. |
| 3 — Family C | NOT STARTED | |
| 4 — Family D | NOT STARTED | |
| 5 — Family E/F advanced + specialized components | NOT STARTED | |
| 6 — Studio finish, full docs, theme configurator, 3 showcases | NOT STARTED (beyond the Phase-0 Storybook shell) | |
| 7 — Independent audit against quality gate | NOT STARTED | |
| 8 — Packaging/release readiness | NOT STARTED | See `RELEASE_CHECKLIST.md`. |

## What Phase 0 actually did

- **Environment**: Node.js and pnpm were not installed on this machine at
  all. Installed Node.js 26.13.1 LTS via `winget` and pnpm 12.21.0 via `npm
  install -g pnpm` (both with explicit user authorization — see session
  transcript). This was a precondition, not optional setup.
- **Version research**: every tool version in `ARCHITECTURE.md` was read
  from the live npm registry (`npm view <pkg> version`/`peerDependencies`)
  on 2026-11-17, not recalled from training data. One deliberate deviation
  from "latest": TypeScript is pinned to 6.0.3, not the registry's `latest`
  (7.0.2), because `typescript-eslint@8.73.0` caps its peer dependency at
  `<6.1.0` — see `ARCHITECTURE.md` for the full reasoning and the revisit
  condition.
- **Repo/workspace**: pnpm workspace (`packages/*`, `apps/*`), root
  TypeScript/ESLint/Prettier config, root `playwright.config.ts`.
- **`@b4/tokens`**: hand-authored CSS (not generated) for `base.css`
  (primitive scale + density/radius/motion/contrast axes),
  `theme-graphite.css`, `theme-porcelain.css`. A typed `applyB4ThemeSettings`
  helper. Builds with `tsup` + a small custom script
  (`scripts/copy-css.mjs`) that copies per-file CSS and inlines `@import`
  into one combined `b4-tokens.css`.
- **`@b4/motion`**: `durations`/`easings`/`springs`/`tween()` constants,
  `useReducedMotion()` hook honoring both OS `prefers-reduced-motion` and
  B4's explicit `data-b4-motion` override.
- **`@b4/react`**: one component, `Button`, taken all the way through the
  quality gate (see `QUALITY_MATRIX.md` for exactly what was checked).
  Building it end-to-end is what proved out (and in two cases, fixed) the
  rest of the Phase 0 scaffold:
  - `tsup` build config, `exports` map, CSS distribution via a
    `styles.css` entry that `@import`s per-component CSS.
  - Vitest + RTL + user-event + jest-axe wiring, including a jsdom
    `matchMedia` polyfill that was missing and had to be added.
  - Storybook 10 + Vite wiring (stories resolved from `packages/react/src`
    into `apps/studio`'s Storybook instance via a glob `stories` path, no
    package build step required for Storybook dev).
  - Playwright + `@axe-core/playwright` wiring against a live Storybook
    instance, including discovering the real story-ID slugification rules
    the hard way (see `TESTING.md`).
  - **Two real accessibility bugs** in the Graphite theme tokens (destructive
    and primary button text contrast) were caught by this pipeline and
    fixed at the token level, not patched around in the component — see
    `CHANGELOG.md`.
- **B4 Studio**: Storybook config (`apps/studio/.storybook`) with a Graphite/
  Porcelain theme toolbar switcher wired to `@b4/tokens`'s
  `applyB4ThemeSettings`. Plus a minimal Vite app shell
  (`apps/studio/src`) — explicitly a placeholder, not the real Studio
  (nav, category browser, full configurator, 3 integration showcases),
  which is Phase 6 scope.
- **Docs infra**: every doc file the mission brief named now exists with
  real, specific content reflecting actual repo state — not filler.

## Verified (commands actually run, not assumed)

```
pnpm install                                    # clean install, no errors
pnpm typecheck                                  # all 4 packages, clean
pnpm --filter @b4/react run test                # 6/6 pass (incl. jest-axe)
pnpm build                                       # tokens, motion, react — clean
pnpm --filter @b4/studio run build-storybook    # clean, Button stories present
npx playwright install chromium
npx playwright test                              # 2/2 pass (incl. axe-core)
```

## Git

Local git repo initialized in Phase 0. **Not pushed anywhere yet** — a
sibling session asked for a GitHub remote
(`github.com/trencito42/b4.git`) to be added and pushed, but later corrected
that to: hold off until the *entire* mission is complete (all phases, or a
genuine stopping blocker), then push once. See `HANDOFF.md`.
