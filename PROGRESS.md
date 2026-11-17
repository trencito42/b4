# B4 — Progress

Read this + `HANDOFF.md` + `git log`/`git status` before doing anything else
on resume. Don't re-plan from scratch — continue from what's actually here.

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 — Init, tokens/themes, motion foundations, Studio shell, docs infra | **DONE** | See below. |
| 1 — Motion foundation components (TextTransition, NumberTransition, AnimatedIndicator, SegmentedControl reference component) | **DONE** | All four built and VERIFIED, plus a `useAsyncStatus` race-safe async-state hook in `@b4/motion`. SegmentedControl refactored onto the shared `AnimatedIndicator` primitive (no more duplicated layoutId logic). |
| 2 — Family A + B to full quality gate | **IN PROGRESS** | Family A: Button, IconButton, ToggleButton, SegmentedControl, Badge VERIFIED (5/12). Family B: Checkbox, Switch, RadioGroup, TextField, Textarea, PasswordField, SearchField VERIFIED (7/20). |
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

## What's new since Phase 0 (same session, same checkpoint cycle)

- **`SegmentedControl`** (Family A): the explicit Changelog/Login reference
  component named in the mission brief. Built on Base UI's `ToggleGroup`/
  `Toggle` (real arrow-key roving focus and ARIA for free, not hand-rolled),
  with a traveling capsule indicator. Controlled + uncontrolled value
  support. Taken through the same full quality gate as Button.
- **Phase 1 completed**: `AnimatedIndicator` (the shared traveling-surface
  primitive, extracted from SegmentedControl's original inline
  implementation and now consumed by it), `TextTransition`
  (crossfade/vertical/horizontal modes), `NumberTransition` (built on
  TextTransition, auto-derives slide direction from increase/decrease),
  and `useAsyncStatus` in `@b4/motion` (idle/pending/success/error with
  race-safe auto-idle timeouts — has a dedicated test for the "second call
  resolves before a stale first-call timeout fires" race).
  - Verified: `pnpm typecheck` (5/5 packages), `pnpm --filter @b4/react run
    test` (23/23), `pnpm --filter @b4/motion run test` (5/5), `pnpm build`,
    `pnpm --filter @b4/studio run build-storybook`, `npx playwright test`
    (7/7, incl. axe-core and rapid-click/rapid-selection stress tests).

## Phase 2 so far: IconButton, ToggleButton, Badge — and 3 more real a11y bugs

- **`IconButton`**/**`ToggleButton`**: straightforward extensions of
  Button's variant/size vocabulary (IconButton) and Base UI's `Toggle`
  (ToggleButton, the standalone single-button counterpart to
  SegmentedControl's grouped `ToggleGroup`).
- **`Badge`**: the first component tested in *both* themes end-to-end
  (`e2e/badge.spec.ts`, using `&globals=b4Theme:porcelain`), not just
  Graphite. That found three more real token-level contrast bugs beyond
  the two from Phase 0 — see `QUALITY_MATRIX.md`'s "Three more real
  accessibility bugs" section and `HANDOFF.md` item 7. Fixed by adding
  `--b4-accent-text`/`--b4-danger-text` tokens and darkening Porcelain's
  `--b4-danger` base value.
- Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
  (33/33), `pnpm --filter @b4/motion run test` (5/5), `pnpm build`,
  Storybook build, `npx playwright test` (9/9, incl. Badge in both
  themes).

## Phase 2, Family B started: Checkbox, Switch, RadioGroup

All three built on Base UI primitives (`Checkbox.Root`/`Indicator`,
`Switch.Root`/`Thumb`, `RadioGroup`/`Radio.Root`/`Indicator`) for real
tri-state/keyboard/ARIA behavior rather than hand-rolled. All three are
now e2e-tested in **both** themes from the start (the lesson from Badge),
and a Playwright worker-concurrency flakiness issue (unrelated to any
component — a shared Storybook dev server under heavy parallel axe load)
was found and fixed by capping `workers: 4` in `playwright.config.ts`.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(48/48), `pnpm build`, Storybook build, `npx playwright test` (16/16,
both themes for every new component).

## TextField added — the base every other text-entry field will extend

Built on Base UI's `Field` (label/description/error wiring, with `Field.
Error match` letting this component's own `error` prop drive visibility
rather than native HTML5 validity) + `Input`. `label` is a required prop,
not optional. Verified in both themes from the start.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(54/54), `pnpm build`, Storybook build, `npx playwright test` (19/19).

## Textarea, PasswordField, SearchField — and a real controlled-value bug

All three extend TextField's pattern (shared `.b4-text-field__*` CSS
classes, Base UI `Field`). PasswordField and SearchField both needed an
*interactive* trailing control (visibility toggle / clear button), which
TextField's `endIcon` slot intentionally can't provide (it's
`aria-hidden`), so they compose the Field parts directly rather than
wrapping TextField — see each component's doc comment.

SearchField's first version had a real bug: the clear button updated
internal state but never actually reset the underlying (uncontrolled)
input's value, because it mixed `value`/`defaultValue` pass-through
inconsistently. Caught by the unit test, not a type error or a visual
check — see `QUALITY_MATRIX.md`'s "A real bug caught by the unit test"
section. Fixed by always computing one current value and passing only
that to the underlying primitive, same pattern SegmentedControl already
used.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(66/66), `pnpm build`, Storybook build, `npx playwright test` (27/27,
both themes for every form control, plus dedicated real-browser e2e for
the password toggle and search-clear interactions).

## Git

Local git repo initialized in Phase 0. **Not pushed anywhere yet** — a
sibling session asked for a GitHub remote
(`github.com/trencito42/b4.git`) to be added and pushed, but later corrected
that to: hold off until the *entire* mission is complete (all phases, or a
genuine stopping blocker), then push once. See `HANDOFF.md`.
