# B4 — Testing

## Layers

1. **Type checking** — `pnpm typecheck` (runs `tsc --noEmit` in every
   package, topologically). TypeScript `strict` is on; this is a hard gate,
   not advisory.
2. **Unit/component tests** — Vitest + React Testing Library +
   `@testing-library/user-event`, per-package (`pnpm --filter @b4/react run
   test`). Every component needs: renders, controlled interaction
   (click/keyboard), disabled/loading blocks interaction, and a `jest-axe`
   `toHaveNoViolations()` check across its variant matrix. See
   `packages/react/src/components/Button/Button.test.tsx` as the reference.
   - jsdom does not implement `window.matchMedia`; the shared setup file
     (`packages/react/src/test/setup.ts`) polyfills it. Any new package that
     needs jsdom tests needs the same polyfill (copy the pattern, don't
     reintroduce the gap).
3. **Storybook** — every component gets a `.stories.tsx` colocated with it,
   with `tags: ["autodocs"]`, a control for every variant prop, and at least
   one "all variants"/"all sizes" overview story. `@storybook/addon-a11y`
   runs axe-core live inside Storybook for every story as you develop.
4. **Browser/e2e checks** — Playwright, root `playwright.config.ts`, tests in
   `/e2e`, run against a live Storybook instance (`webServer` config starts
   `storybook dev` automatically). This is where real interaction timing
   (rapid clicks, focus trapping, animation interruption) and `@axe-core/
   playwright` checks against the *rendered* DOM (not jsdom) live. Storybook
   story IDs are `kebab-case` derived from the story's `title`/export name —
   check `apps/studio/storybook-static/index.json` after a Storybook build
   if a test can't find a story (don't guess the ID from the title string;
   Storybook's slugification isn't a 1:1 lowercase-and-hyphenate — it
   collapses punctuation like "—" and "&" in ways that are easy to get
   wrong, as happened and was fixed while building Button's e2e test).
   - Playwright browsers must be installed once per machine:
     `npx playwright install chromium`.
   - Storybook's own `addon-a11y` runs a background axe scan whenever a
     story loads. A manually-triggered `AxeBuilder.analyze()` fired too
     soon after navigating to or interacting with a popup-bearing story
     (Tooltip, DropdownMenu, Select, Combobox) can collide with it
     ("Axe is already running"). A short `page.waitForTimeout(300)`
     before the manual scan avoids the race — see `e2e/tooltip.spec.ts`.
   - At high worker concurrency (the Playwright default scales with CPU
     cores), the single shared Storybook dev server can occasionally throw
     "Execution context was destroyed, most likely because of a
     navigation" from `AxeBuilder.analyze()`, or produce other timing-
     dependent flakes — this is test-infra contention under load, not a
     product bug. `playwright.config.ts` caps `workers` (lowered from 4 to
     3 as the suite grew past ~27 tests and 4 started flaking again) — if
     it still flakes, rerun once before assuming a regression, and if it
     keeps flaking as the suite grows further, lower `workers` again
     rather than assume every flake is a false alarm forever.
   - Axe's "best-practice" page-structure rules (`page-has-heading-one`,
     `landmark-one-main`, `region`) are **disabled** for isolated-component
     iframe checks (`e2e/button.spec.ts`) — they're false positives against
     a bare `iframe.html` holding one component, not a full page. They stay
     enabled for the eventual Studio integration-showcase pages (Phase 6),
     where a real page structure is expected.
5. **Manual theme/density/radius/contrast/motion sweep** — until the Studio
   configurator exists (Phase 6), do this via the Storybook theme toolbar
   (Graphite/Porcelain) and by temporarily setting `data-b4-density`/
   `data-b4-radius`/`data-b4-contrast`/`data-b4-motion` on `<html>` in
   devtools. Every VERIFIED component must have been looked at in both
   themes — see `QUALITY_MATRIX.md` for what's actually been checked vs.
   calculated.

## Color contrast

Don't eyeball it. The destructive/primary Button variants exist at their
current lightness values because the axe-core Playwright check caught
insufficient white-on-fill contrast at the original, better-looking-by-eye
values — see `ARCHITECTURE.md` and git history on
`packages/tokens/src/theme-graphite.css` /`theme-porcelain.css`. When in
doubt, compute the WCAG contrast ratio directly (relative luminance formula)
against the *actual* adjacent color the token will render next to — a solid
white-text fill and a colored-text-on-dark-surface use of the same raw hue
can need different lightness values; don't assume one token value works for
both without checking.

## Running everything

```bash
pnpm install
pnpm build        # builds workspace packages first so dist/index.d.ts exist on clean checkout
pnpm typecheck
pnpm --filter @b4/react run test
npx playwright install chromium   # once per machine
npx playwright test
```

## The craftsmanship audit

```bash
pnpm audit:craftsmanship
```

A mechanical sweep over every component, every story file and the Studio
catalog (`scripts/craftsmanship-audit.mjs`). It writes
`CRAFTMANSHIP_AUDIT.md` and exits non-zero on any BLOCKER, so it is part
of `pnpm release:verify` and CI. It checks the invariants a human eye
misses — an unresolvable `var(--b4-*)`, a hardcoded colour, a story with
no `Default`, a catalog link pointing at a story that does not exist.

Two rules about the audit itself, learned the hard way:

- **It must not report false positives.** A gate that cries wolf gets
  ignored, and then it protects nothing. Tokenised durations count as
  reduced-motion safe (the token layer zeroes them); a component sharing
  another component's stylesheet may use that component's class names.
- **A colour literal is only excusable in writing.** A stylesheet opts one
  out with `/* b4-audit-allow: <reason> */`, and the reason is required —
  the report lists every exemption rather than hiding it, so the next
  reader can challenge it.

## Before a Playwright run

Two failures here look exactly like product bugs and are not:

- **A long-lived Storybook dev server serves a stale index.** It does not
  pick up new or renamed stories, so a story that was just added resolves
  in one run and not the next — and the failure reads as "the component
  is not rendered!". Kill the Storybook process and let Playwright start
  a fresh one before any run that depends on a story id.
- **A dev server on `:5173` silently replaces the Studio preview.** Check
  `Get-NetTCPConnection -LocalPort 5173` before trusting a Studio
  failure; the reserved ports are `:5173` (Studio preview) and `:6106`
  (Storybook).

## Release gate (Phases 7–8)

```bash
pnpm release:verify    # typecheck, build, unit tests, Storybook build, smokes
npx playwright test    # full suite incl. Studio + visual baselines (run twice on milestones)
```

CI runs the same checks on push/PR (`.github/workflows/ci.yml`).

## Visual review

Studio’s **Visual review** compares live Storybook stories in Graphite and
Porcelain at widths of 320, 390, 768, 1024, 1440, and 1920 px. Run Storybook
alongside Studio. For a non-local deployment, set `VITE_STORYBOOK_URL` to a
Storybook origin that allows framing by the Studio host.

To capture every default story in Chromium, run `node scripts/visual-review.mjs`
while Storybook is serving. Set `B4_REVIEW_ORIGIN` to use a static Storybook
server on a different port. The script writes the screenshot index and JSON
measurements to `test-results/visual-review/` and reports rendering errors
and document overflow. The default matrix uses reduced motion for consistent
captures. Playwright interaction specs test active motion and popup behavior.

## Known gaps (tracked, not hidden)

- **npm publish** — proofs done; scope + explicit user authorization still
  required (`RELEASE_CHECKLIST.md`).
- **`references/`** — no third-party reference screenshots committed
  (licensing/size); art direction is specified in `ART_DIRECTION.md` and
  visual baselines live under `e2e/visual-regression.spec.ts-snapshots/`.
