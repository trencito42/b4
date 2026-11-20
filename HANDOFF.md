# HANDOFF — read this first on any resume

## Next action: DateRangePicker (2026-11-20)

Phase 2's component gaps are closed except **DateRangePicker**, which is
the next thing to build (reuse `DatePicker`'s calendar engine and
`internal/monthGrid.ts` — do not write a second one). After that the
remaining brief scope is charts (LineChart/AreaChart/BarChart/DonutChart,
evaluating a mature library rather than writing an engine), `Carousel`,
then system-wide polish and the three application showcases.

`ToggleGroup`, `InputOTP` and `TagsInput` are **done and verified** — do
not rebuild them. Phase 1 (RefractionSweep removal) is fully complete;
the only remaining mentions of it in the tree are two deliberate
historical comments explaining the removal.

## Current state: zero decorative effects, one entry point (2026-11-20)

B4 ships **92 components from one entry point** (`@b4/react`) and **no
decorative effects**. `RefractionSweep` — the last one, and the component
originally named `DistortionWave` — was deleted today along with the
entire `@b4/react/effects` subpath, the Studio Effects Lab, the catalog's
"Effects" family, and `docs/effects/`. `BorderBeam` and `DistortionWave`
went on 2026-11-19. All of this is **deliberate scope, not unfinished
work**: do not re-add any of them under these or new names unless the
owner asks again. See `CHANGELOG.md` (2026-11-20 entry) for exactly what
was deleted.

Functional motion stays, as ordinary components: `TextMorph`,
`TextTransition`, `NumberTransition`, `AnimatedIndicator`,
`TransitionGroup`, `MorphingSurface`. They carry state; effects decorated
it. Studio's Confirmation showcase was rewritten accordingly — receipt
rows and a success `InlineAlert` now enter via `TransitionGroup` only
once the simulated payment resolves.

Verified at the removal checkpoint: `@b4/react` + Studio typecheck clean,
package build clean without the effects entry, unit suite **537/537**
(548 minus the 11 deleted RefractionSweep tests), craftsmanship audit
**0 blockers, 0 warnings** across the 91 then-shipping components.
After `ToggleGroup`,
`InputOTP` and `TagsInput` landed: unit suite **584/584**, audit
**92 components, 0 blockers, 0 warnings**.

**Known debt, not introduced here:** `npm run lint` reports 28
`no-explicit-any` errors + 6 warnings, all pre-existing in test files
(`usePointerSelection.test.ts`, `usePressFeedback.test.ts`,
`useGestureIntent.test.ts`, `use-async-status.test.ts`,
`TextMorph.test.tsx`/`engine.ts`) and two unused imports in
`StudioApp.tsx`. CI does not currently run lint (see
`.github/workflows`), which is why these survived. Not fixed in this
checkpoint to keep the effects removal reviewable on its own.

**Next:** the current brief's Phase 2 — the missing standard components,
in priority order: `DateRangePicker`, `TagsInput`, `ToggleGroup`,
`InputOTP`, then charts and `Carousel`.

## Local continuation (2026-11-20)

Studio has a live Visual review page, an interactive Infrastructure
showcase and verified Settings and Confirmation flows. The workspace includes
the inherited consumer fixtures and component fixes. The release gate and
two fresh Playwright runs passed, each with 450 tests. The second run used a
separate checkout with a fresh frozen install and build. Publication
requires the npm scope and explicit authorization in the release checklist.
[Quality matrix](QUALITY_MATRIX.md) [Release checklist](RELEASE_CHECKLIST.md)

## Batch 3 forms review (2026-11-20)

The forms review records the baseline defects, the fixes, and the inspected
Storybook evidence for both themes at 390, 768, and 1440 px. The forms
checks passed. Two fresh full runs reproduced the existing TextMorph
contrast failure on a fading token, so the whole-suite gate remains open.
[Forms audit](FORMS_CRAFTSMANSHIP.md) [Quality matrix](QUALITY_MATRIX.md)

Use the Forms Review story when comparing the family in future work. It
renders single and range values with the same `Slider` implementation.

The historical NumberField and PasswordField animation tests passed in the
fresh baseline suite. New regressions cover fractional
stepping with hold and release, selection retention while revealing a
password, and the DatePicker grid receiving keyboard focus on open.

## Mission priority changed: `BorderBeam`/`DistortionWave` removed, focus is now system-wide coherence (2026-11-19, read this first)

The project owner explicitly changed priorities after the `DistortionWave`
fix below: **stop developing decorative advanced effects.** Both
`BorderBeam` and `DistortionWave` (the real WebGL2 dual-view engine that
section below describes fixing) were deleted completely — the DistortionWave
section immediately below is now **history**, not current status; the
effect it describes fixing no longer exists in this repository. See
`REQUIREMENTS_TRACEABILITY.md` §0.5 and `CHANGELOG.md` for the full
removal record. Do not resurrect either effect, under these names or new
ones, without the user asking again.

The new mission (per the same brief) is a large, multi-session effort:
make all components (89 as of this writing — see below) feel like one coherently designed system —
real visual QA in a browser across both themes and six viewports, forms
craftsmanship, closing genuine missing-primitive gaps, three realistic
application showcases, and a proper Studio review environment. This is
**not completable in one session.** What's actually done so far (this
session, Batch 1 of the brief's own 8-batch plan): the effects removal
above, full local verification (typecheck/build/521 unit tests/Storybook
build/Studio build/consumer+SSR+treeshake smoke/craftsmanship audit all
clean), and 3 pre-existing e2e failures identified as unrelated
(`Calendar` porcelain axe — a navigation-timing flake; `NumberField`
step-accept and `PasswordField` visibility-toggle — both read as real
functional bugs in `e2e/field-motion.spec.ts`, not flakes, not caused by
this session's changes, not yet root-caused). Batches 2–8 (standard
component gaps, forms craftsmanship, navigation/overlays/layout, data/
feedback polish, cross-family visual QA, three application pages, final
verification) are **not started**. The CI Storybook-build failure the
brief named could not be root-caused from this session — GitHub Actions
logs require sign-in this session doesn't have; every step in the
canonical pipeline (`pnpm build`/`typecheck`/`test`/`build-storybook`/
`build` (Studio)/`consumer-smoke`/`ssr-smoke`/`treeshake-check`/
`audit:craftsmanship`) reproduces clean locally, so either the CI
failure is environment-specific (Linux-only) or this commit already
fixes whatever it was — the next CI run on this commit is the real
answer, not a local reproduction.

**Batch 2 (standard component gaps) done, same session, next commit.**
Audited the 84 (now 89) components against the brief's full primitive
list (actions/forms/navigation/overlays/data/feedback/application
structure + the explicitly-named "may be missing" list: ScrollArea,
Separator, AspectRatio, Stack, Grid, Container, Collapsible,
VisuallyHidden). Five were genuine gaps and got built: `Separator`,
`VisuallyHidden`, `AspectRatio`, `Collapsible`, `ScrollArea` — each on
Base UI where Base UI has the primitive, plain CSS where it doesn't need
more. `Stack`/`Grid`/`Container` were deliberately **not** built — the
brief's own §14 says plain CSS + spacing tokens is the right tool for
layout, not a named component; wrapping a flex/grid `gap` in a component
adds a name to learn without adding behavior. Found and fixed a real bug
during verification (not just claimed VERIFIED): `ScrollArea`'s viewport
had no `overflow` CSS at all, so nothing scrolled despite the component
rendering fine — caught by an e2e `scrollHeight > clientHeight`
assertion, not a screenshot. Verified: typecheck clean, 545/545 unit
tests, Storybook/Studio build clean, craftsmanship audit 0/0,
`e2e/layout-primitives.spec.ts` 17/17, full suite 423/424 (same one
pre-existing TextMorph contrast failure, still untouched/unrelated).

At the Batch 2 checkpoint, batches 3–8 were unstarted. The current forms
status appears at the top of this handoff. Navigation, overlays, layout,
data and feedback polish, cross-family QA, application showcases, and final
verification belong to later batches.

## DistortionWave: the real bug behind "I don't see the effect" (2026-11-19 — superseded by removal above; kept as history)

The user reported the WebGL `DistortionWave` engine (built earlier the same
day, commit `fd3a1ca`) was "cam gata" (supposedly done) but produced no
visible effect anywhere. Investigated live in the browser via the
project's own "DistortionWave Debug" page:

- **Gate 1 (DOM capture) passed** — the captured canvas looked right.
- **Gate 2 (feed that capture to the WebGL shader) threw immediately**:
  `SecurityError: Failed to execute 'texImage2D' ... Tainted canvases may
  not be loaded`.

Root cause: `DomCapture.ts` rasterized each view via an SVG
`foreignObject` → `<img>` → `drawImage`. In Chromium, a canvas painted
this way is **permanently tainted**, even for a same-origin `blob:` URL
with zero external resources — it can still be *displayed* (which is all
a purely visual check like Gate 1 catches), but `texImage2D`/
`getImageData` on it throws the instant anything tries to read its pixels
for real. So the shader never got a texture, with no on-screen sign
anything was wrong. Separately, the new `DistortionWave` also had no
Storybook story and wasn't wired into any real Studio page — only that
raw, explicitly-labeled-development-only debug page could reach it at
all, which is the other half of why the user never saw it.

**Fixed**: `DomCapture.ts` now paints directly with Canvas2D primitives
(`fillRect`/`strokeRect`/`fillText`, `Range.getClientRects()` for real
per-line text positions) instead of rasterizing an SVG image — painting
never loads a raster image into the canvas, so nothing can taint it.
Verified by instrumenting `texImage2D` live in the browser (zero throws)
and visually at progress 0.45 (real geometric text displacement +
chromatic separation near the wavefront, exactly the brief's own
acceptance-gate bar). Also: added real `DistortionWave.stories.tsx` +
`DistortionWave.test.tsx` (none existed before), fixed the orphaned
`e2e/distortion-wave.spec.ts` (it was still testing the *old*,
since-renamed `RefractionSweep` effect by its old class names — renamed
to `e2e/refraction-sweep.spec.ts` and retargeted; a genuinely new
`e2e/distortion-wave.spec.ts` now tests the real engine, including a
regression test for the exact taint bug above), wired a real payment-
confirmation demo into B4 Studio's Effects Lab (Confirm → wave → success,
geometry selector — not just the debug page), and added `RefractionSweep`
to the Studio catalog (the craftsmanship audit caught it was missing).
Full gate re-run clean: typecheck, `@b4/react` 538/538 unit tests,
`@b4/studio` typecheck, full Playwright suite 423/424 (the one remaining
failure is a pre-existing `TextMorph` color-contrast issue, confirmed via
`git stash` to fail identically with none of today's changes applied —
unrelated, not touched). See `QUALITY_MATRIX.md`'s `DistortionWave`/
`RefractionSweep` rows for the full detail.

**Working-tree note**: a `git stash`/`stash apply` to compare against the
pre-fix state hit a real conflict on `pnpm-lock.yaml` (a local lockfile
change already present at session start, unrelated to this work, collided
with the stash's own lockfile diff) — resolved by stashing the lockfile
separately, applying the real work, then `pnpm install` to reconcile.
`git stash list` still has two leftover entries from that
(`stash@{0}`/`stash@{1}` as of this writing) — safe to drop once
confirmed unneeded, left in place here since dropping a stash is a
destructive action this session doesn't take without being asked.

## Mission status — **COMPLETE in-repo** (prompt phases 0–8, 2026-11-19)

The B4 mission brief is fulfilled in this repository. **Not published to npm**
without explicit user authorization and a confirmed package scope.

### Project identity

B4 — commercial-grade React design system, Graphite + Porcelain, 92 public
components (`@b4/react`), tokens/motion packages, Storybook + B4 Studio.
`RangeSlider` is documented as sharing `Slider`'s implementation rather
than being a component of its own, so it's not counted separately. The
count moves as work lands — `scripts/craftsmanship-audit.mjs` is the
live source of truth (`Craftsmanship audit: N components`), not this
number; re-run it rather than trusting a cached count here.

### Current Git state

| Item | Value |
|---|---|
| Branch | `main` |
| Latest checkpoint | `93ad0ac` — Phase 7–8 (smokes, Studio e2e, visual baselines) |
| Prior checkpoints | `13eabb0` Phase 6 Studio; `14b2894` Family F close |
| Uncommitted | none expected after mission-close doc commit |

### Completed work (prompt §10)

Phases **0–8** DONE per `PROGRESS.md` phase table. All inventory rows
**VERIFIED** in `COMPONENT_INVENTORY.md` / `QUALITY_MATRIX.md`.

Latest additions:
- **First-Party Intelligent Text Morphing Engine (`TextMorph`), 2026-11-19.**
  Built by a concurrent session in this same checkout and committed directly
  to `origin/main` (`2f85f74`). A second session (this one), unaware that
  commit existed, built an independent TextMorph implementation off an
  earlier, in-progress snapshot and at one point incorrectly suspected the
  claims below of being fabricated. On merge, both were compared: this
  implementation was independently re-verified for real (clean worktree,
  `@b4/motion`/`@b4/tokens`/`@b4/react` rebuilt from scratch) — every claim
  below checked out exactly — and kept; the second session's TextMorph was
  discarded as redundant. See `PROGRESS.md` for the full note.
  - Implemented `TextMorph` with Unicode segmentation, distance-affinity bipartite matching, numeric place values, and fluid FLIP layout adaptation.
  - Backwards-compatible `mode="morph"` support in `TextTransition` and `NumberTransition`.
  - Added interactive `TextMorphLabPage` to B4 Studio with 6 benchmark cards.
  - 13 engine unit tests, 6 component unit tests, 4 Playwright e2e tests, all axe-clean.
  - Full suite: **504/504** vitest tests passing, 0 typecheck errors, Studio & Storybook build clean.
- **`BorderBeam` effect (`packages/react/src/effects`, `@b4/react/effects`), 2026-11-19.**
  Built by the second session (this one) — does not conflict with the above.
  CSS mask-XOR animated border ring. Softened from an initially too-solid/
  hard-edged ring to a soft blurred glow per explicit user visual feedback
  ("sa le verifici borderbeam trb sa fie mai difuz..."). 7 unit tests + 7
  Playwright e2e tests, both themes, verified twice.

Latest adaptive UX & interaction improvements:
- **Interaction Primitive Hardening (Priorities 1–4)**:
  - `usePointerSelection`: synchronous ref tracking (`lastValidHitRef`, `didScrubRef`), guaranteed single commit on pointer release, `onClickCapture` click suppression post-scrub preventing Base UI double-commits.
  - `useGestureIntent`: strict axis locking, vertical scroll cancels horizontal gesture intent exactly once via `cancelledRef`, deltaX/deltaY passed to `onGestureEnd`.
  - `useSwipeNavigation`: pointer capture on confirmed horizontal swipes, interactive child element protection (`isInteractiveTarget` for buttons, links, inputs, sliders), rubber-band damping (0.28), RTL support, and disabled item skipping.
  - `usePressFeedback`: strict B4 motion tokens (`var(--b4-duration-fast, 140ms)`, `var(--b4-ease-standard)`), tactile keyboard Space/Enter press state, no duplicate click emissions.
- **AppShell Mobile Architecture (Priority 5)**:
  - Exported `AppShellMobileTrigger` and `useAppShell()` hook with `AppShellContext`.
  - Added `inert={isMobile && !isOpen}` focus isolation on hidden sidebar, preventing keyboard focus leaks to invisible elements.
  - Focus restoration to trigger on close, smooth backdrop fade animation, integration into Studio header and `AdaptiveMobile` story.
- **Specification Reconciled (Priority 6)**:
  - Reconciled `ADAPTIVE_UX_SPEC.md` with authentic `@b4/motion` spring and duration tokens.
- **CI / Storybook / Axe Race Condition Fixed (Priority 7)**:
  - Fixed Storybook `@storybook/addon-a11y` concurrent run conflict with Playwright `AxeBuilder` by configuring `a11y: { manual: true }` in `.storybook/preview.tsx`.
  - Restored `Toast` and `TransitionGroup` story contracts expected by e2e tests.
- **Real Interaction E2E Testing**:
  - Authored `e2e/adaptive-interactions.spec.ts` with 8 Playwright interaction tests (pointer scrubbing, rapid drag, Escape abort, disabled targets, axe on Graphite/Porcelain, swipe navigation, interactive child button isolation, AppShell mobile drawer).
- Gate: **485/485** `@b4/react` unit tests (87 suites), monorepo typecheck 0 errors, **19/19** targeted e2e tests passing.

### Mission brief completed: DistortionWave, Effects Lab, audit, fixtures (2026-11-19 evening)

Everything the earlier session listed as "not started" is now built,
verified per `TESTING.md`, and committed. The headline is not the new
effect — it is that the **systematic audit found real defects in code
that had already been marked VERIFIED**.

**`DistortionWave` — `packages/react/src/effects/DistortionWave/`**
- A travelling band of *refraction*: it uses `backdrop-filter` against
  the pixels actually rendered behind it, so the content genuinely bends
  as the wave crosses and resolves again behind it. It is not a painted
  copy of the content.
- A chromatic fringe and a specular crest ride the same keyframe track as
  the band, so they can never drift out of alignment with it.
- Reduced motion: the band holds still **and drops the refraction
  entirely** — text must never be left sitting behind frosted glass that
  will not move away.
- 9 unit tests, 11 Playwright tests (both themes), incl. a pixel-diff
  test that proves the wave really changes the rendering of the content
  beneath it.

**B4 Studio Effects Lab** (`apps/studio/src/studio/pages/EffectsLabPage.tsx`)
— live controls for both effects, plus a "composed" card showing
BorderBeam (edge) and DistortionWave (face) together.

**The systematic craftsmanship audit — `scripts/craftsmanship-audit.mjs`**
- 14 mechanical invariants over every component (count grows as the
  library does — see "Project identity" above, not this historical
  number), every effect, every story file and the Studio catalog.
  Re-runnable, exits non-zero on a
  BLOCKER, wired into `pnpm release:verify` and CI. Report:
  `CRAFTMANSHIP_AUDIT.md`.
- Its own first rule was *don't report false positives*: a component that
  animates with tokenised durations is reduced-motion safe (the token
  layer zeroes them), a component that shares another component's
  stylesheet is allowed that component's class names, and a colour
  literal can be excused only by a written, in-file justification
  (`b4-audit-allow: <reason>`), which is listed in the report rather than
  hidden.

**Real defects the audit found in already-VERIFIED code**
- **62 of 83 Studio catalog deep links were dead.** The catalog slugified
  camelCase names by splitting them (`IconButton` → `icon-button`);
  Storybook does not (`iconbutton`). Nothing caught it: the catalog
  rendered perfectly, axe was clean, the stories existed. Now all 86
  links resolve, gated by `e2e/studio-catalog-links.spec.ts`, which
  compares the rendered hrefs against Storybook's *published* story index.
- **27 components published no `Default` story**, so the catalog's
  `--default` contract had no target for them.
- **Four Family B stories** said "Inputs & Forms" while their fourteen
  siblings said "Forms & Inputs" — one family split across two slugs.
- **`@b4/tokens/css` and `@b4/react/styles.css` had no `types`
  condition**, so the documented one-line CSS import failed to typecheck
  in any consumer (TS2882). The consumer fixtures caught this — which is
  exactly what they are for.
- **Four components had no axe assertion** in their unit tests
  (`Badge`, `AnimatedIndicator`, `MorphingSurface`, `TransitionGroup`)
  and **three had no browser coverage at all** (`ButtonGroup`,
  `KeyboardShortcut`, `StatusBadge`).
- **Hardcoded colours**: modal/drawer scrims → new `--b4-scrim` /
  `--b4-scrim-strong` tokens; NavigationMenu's inner highlight → new
  per-theme `--b4-surface-highlight`; ColorPicker's hue spectrum and
  axes → documented exemptions (they are the picker's *data*, not theme
  colours); mask alphas in the effects → documented exemptions (a
  luminance mask carries no colour). The Toast spinner's hand-written
  `0.75s` → a `--b4-duration-spinner` token, so reduced motion can stop
  it like every other duration.

**Two internal consumer fixtures** — `examples/ops-console` (an internal
operations console) and `examples/storefront` (a consumer storefront).
Real application shapes, public `@b4/react` APIs only, both themes, with
`scripts/consumer-fixtures-smoke.mjs` building them as a gate. Their `dev`
scripts are pinned to **:5174** and **:5175** with `--strictPort`, so they
can never collide with the Studio preview on `:5173`.

### What the fixtures caught that the gate did not (2026-11-19, after close)

Building the fixtures put the library through a real consumer's hands for
the first time, and that found a defect no amount of unit testing had:

**`SegmentedControl` never committed a plain mouse click.** Two causes,
stacked:
1. `usePointerSelection` captured the pointer on `pointerdown`, so the
   browser retargeted the `click` to the container and Base UI's `Toggle`
   never received it.
2. The press-down preview moved the group's selected value onto the
   pressed segment *before* the click landed; Base UI computes
   `nextPressed = !pressed` from the group value, so the click read as
   "deselect the already-selected segment" and was discarded.

The hook's own commit path only runs past the 6px scrub threshold, so a
plain tap fell through every path and changed nothing — while the capsule
and label colour *looked* right, because the press-down preview had
already moved them.

**Why the old tests missed it:** jsdom has no layout, so every
`getBoundingClientRect()` is a 0×0 dot at the origin, `user.click` always
reports the pointer at (0,0), and the hook's hit-testing always resolved
to the *first* segment rather than the clicked one. The existing "moves
selection on click" test was exercising a different path than a real
click. **A jsdom test that stubs real rects is worth more than a click
test that cannot fail.**

**Fix:** capture the pointer only once a scrub is confirmed; start the
preview with the scrub rather than with the press. The capsule now travels
to the segment on commit.

**Three regression tests, each verified to FAIL against the old code
before the fix was accepted** — `e2e/segmented-control.spec.ts` (real
mouse click, both themes), a jsdom test with real segment rects, and a
hook test asserting no capture on `pointerdown`. If you change
`usePointerSelection` again, run all three.

### Ref forwarding — 33 leaf components (2026-11-19)

`Badge`, `ActivityFeed`, `Avatar` and 30 more rendered a root element but
accepted no `ref`. All 33 now forward a ref to their real root element
via `forwardRef` with a named function expression. Rendered markup is
unchanged.

Five are deliberately still without a ref, and the reason is in each
component's source: `ColorPicker`, `FileUpload`, `TimePicker` render
through `Field`; `FileExplorer` renders through `TreeView`;
`NotificationPanel` renders through `Popover`. None of those forwards a
ref yet, and each is a compound component where one ref target would be
ambiguous. That is the honest remainder — do not "fix" it by forwarding a
ref to the wrong element.

**Storybook serves a stale index — restart it before a full Playwright
run.** This cost more time than any real defect above. A long-lived
`storybook dev` keeps an index that does not pick up new or renamed
stories, so a story that was just added resolves in one run and not the
next, and the failure looks exactly like a product bug ("the component
is not rendered!"). Kill the Storybook process and let Playwright start a
fresh one before any run that depends on a story id. Same class of
problem: **a dev server on `:5173` silently replaces the Studio preview**
— check `Get-NetTCPConnection -LocalPort 5173` before trusting a Studio
failure.

**The stray nested clone at the repo root (`b4/`) was auto-committed as a
gitlink** by the runtime's automatic commit, which would have pulled
another repository's history into this one. It is now untracked and
ignored (`.gitignore` → `/b4/`); the directory itself was left in place,
as intended.

### Current task

**The full mission-brief scope is built and verified (2026-11-19 evening).**
See the section below — *DistortionWave, the Studio Effects Lab, the
systematic craftsmanship audit, and two internal consumer fixtures* — for
what landed and what it cost in real defects. Two further passes closed
the remaining gaps the fixtures exposed: the **`SegmentedControl` plain-click
defect** (fixed, with three regression tests each proven to fail against
the old code) and **ref forwarding on 33 leaf components**.

The one piece still open is **npm publish**, which needs an explicit
decision from the user (real scope + authorization), per
`RELEASE_CHECKLIST.md`.

### Next actions (ordered)

1. **Publish (blocked on the user):** confirm the real npm scope →
   user authorizes → `pnpm publish --dry-run` per `RELEASE_CHECKLIST.md`.
2. **Re-run the gate before any release**: `pnpm release:verify` now also
   runs `pnpm audit:craftsmanship`, and the Playwright suite must pass
   twice.
3. **Kill any stray dev server before a Playwright run** — see the
   "Storybook serves a stale index" note below; it is the single most
   common cause of a confusing failure in this repo. The stray nested
   clone at `b4/` has been observed restarting its own Storybook on
   `:6106` more than once; if `6106` is occupied, check
   `Get-CimInstance Win32_Process -Filter "ProcessId=<pid>"` and confirm
   the command line points at `b4\b4\apps\studio` rather than
   `apps\studio`.
4. **The remaining ref-forwarding gap is the compound components**
   (`Field`, `TreeView`, `Popover`, `Tabs`, `DataTable`, …). They are
   excluded by design because a single ref target is ambiguous for a
   compound component; if you close them, they need a deliberate API
   decision (a `ref` on the *root* part, or a parts API), not a blanket
   `forwardRef`.
5. Optional polish: `SegmentedControl` no longer previews the pressed
   segment on press-down — it was the cause of the swallowed click. If the
   press-down affordance is wanted back, it has to be decoupled from the
   group's selected value (a separate preview attribute), not restored to
   the old behaviour.

### Files to inspect on resume

`ADAPTIVE_UX_SPEC.md`, `PROGRESS.md`, `COMPONENT_INVENTORY.md`, `RELEASE_CHECKLIST.md`,
`apps/studio/src/studio/StudioApp.tsx`, `playwright.config.ts`.

### Verification (evidence 2026-11-19)

```
npm exec --yes pnpm@12.21.0 run release:verify
npx playwright test                         # 368 tests; run twice on milestones
```

Playwright `webServer`: Storybook `:6106` + Studio `vite preview` `:5173`.
Rebuild `apps/studio` before preview if Studio UI changed.

### Known issues / constraints

- Do **not** animate `color` on token-driven controls when Studio swaps
  `data-b4-theme` (axe mid-transition) — fixed on `SegmentedControl`, `Link`.
- `pnpm` may be absent from PATH on Windows — use `npm exec --yes pnpm@12.21.0`
  or `node_modules\.bin`.
- No Blipmade imports anywhere (hard rule).
- `references/` has no third-party screenshots — see `references/README.md`.
- A long-lived Storybook dev server reused across two back-to-back full
  Playwright runs (`reuseExistingServer`) was observed to intermittently
  fail to resolve a story (`NoStoryMatchError` / request timeouts) even
  though `index.json` had it — 6 `border-beam.spec.ts` tests failed once
  this way. Reproduced, then resolved by killing the server and letting
  Playwright start a fresh one; re-ran clean (7/7, then full suite
  390/390) immediately after. Root cause not fully diagnosed — if this
  recurs, restart the dev servers (don't assume a real regression) and
  consider adding a periodic server restart to the "run twice" process.

### Environment note

If Playwright cannot start `webServer`, run Storybook manually on `:6106`
(`apps/studio/node_modules/.bin/storybook.cmd dev -p 6106 --ci`); config uses
`reuseExistingServer` when not in CI.

## THE BLOCKING GATE BELOW IS CLOSED (2026-11-17, later same day — read this first)

Everything from here down to "Things the next session needs to know" was
written by a session whose environment could not start the CLI Playwright
webServer (`EPERM` on Storybook's profile settings) and verified only via
manual browser control, leaving all twenty existing components at
IMPLEMENTED pending "the full browser gate" / "the CLI regression." A
later session the same day had a working CLI Playwright setup end to end
and ran exactly that gate:

```
pnpm install
pnpm typecheck                                 # 5/5 packages clean
pnpm --filter @b4/react run test               # 129/129
pnpm --filter @b4/motion run test              # 5/5
pnpm build                                      # clean
pnpm --filter @b4/studio run build-storybook   # clean
npx playwright test                            # 87/87 — run twice, stable
```

One real finding, fixed: `select.spec.ts`/`combobox.spec.ts` failed
`aria-hidden-focus` against Base UI's own internal focus-guard sentinels
(`data-base-ui-focus-guard` elements — deliberately `aria-hidden="true"`
+ `tabindex="0"` to catch Tab/Shift+Tab at a popup's edge and redirect
focus back inside, the standard focus-sentinel technique, not a defect).
This is the exact thing the Combobox checkpoint below already flagged by
hand as "2 inconclusive" — the real CLI run turned that into a specific,
named, confidently-dismissed rule. Disabled it in both spec files with
the reasoning written inline. Also added missing both-theme e2e axe
coverage for `IconButton`/`ToggleButton` (`e2e/icon-toggle-button.spec.ts`),
the only two of the twenty components that had none.

**All twenty existing components are now VERIFIED**, not IMPLEMENTED —
`QUALITY_MATRIX.md` and `COMPONENT_INVENTORY.md` have been updated to
match. Don't re-run the "browser gate" as if it's still open; it's
closed. If you're a future session reading the detailed notes below,
treat every "remains IMPLEMENTED / browser gate pending / CLI blocked"
statement in them as **resolved**, not current.

## Update (2026-11-17, still later): Family A done, DropdownMenu opens Family C

Built `Link`, `StatusBadge`, `Avatar`, `AvatarGroup`, `KeyboardShortcut`,
`ButtonGroup`, `SplitButton` — **Family A is now complete, all 12
VERIFIED**. `SplitButton` needed a real dropdown menu (not a decorative
chevron), so `DropdownMenu` was pulled forward from Family C and built
properly (real Base UI `Menu`): it's the first Family C component,
VERIFIED, and `SplitButton` just composes it.

**Real bug found and fixed**: SplitButton's first story forgot to pass
the required `onSelect` prop; clicking a menu item threw inside the
click handler and silently blocked Base UI's own close-on-click logic.
Found via `page.on("pageerror", ...)` in a throwaway debug test, not by
guessing. See `QUALITY_MATRIX.md`'s "A real bug, caught building
SplitButton's own test" for the full writeup and the two related test-
timing fixes (axe sampling mid-fade; a rapid-cycle test racing the
settle spring under full motion — both now follow the pattern already
proven stable in `select.spec.ts`).

## Update (2026-11-17, even later): MultiSelect, InputGroup — Family B at 15/19

Added `MultiSelect` (shares `Select`'s Base UI Root with `multiple`,
same pattern as Slider/RangeSlider) and `InputGroup` (joins a — possibly
interactive — addon with an input in one visual box; distinct from
`TextField`'s `aria-hidden` icon-only slots). Both reuse existing
stylesheets. 164/164 unit, 115/115 e2e (twice), all clean on the first
try — no new bugs this batch.

## Update (2026-11-17, latest): Tabs (Family C at 4/17) + motion improvements

Added `Tabs` (real Base UI roving-tabindex nav + its own `Tabs.Indicator`
for the traveling highlight). **Real bug**: the selected-tab CSS guessed
`[data-selected]` instead of the actual `data-active` attribute, so
selected-tab text silently stayed the wrong (unselected) color — caught
by the Playwright axe scan as a 1.42:1 Porcelain contrast failure, not
by eye. **New rule for every future Base UI primitive**: check that
primitive's own `*DataAttributes.d.ts` for its exact "is-active"/"is-
selected" attribute name before writing CSS for it — don't assume it
matches a previous component's convention (Checkbox/Switch/RadioGroup/
SegmentedControl all happen to use `data-pressed`/`data-checked`; Tabs
uses `data-active`; there's no guarantee the next one matches either).

Also fixed renewed `select.spec.ts` flakiness (Storybook's background
axe scan colliding with a manual one; a keyboard test firing too fast
after a popup opened) with the proven settle-wait pattern — confirmed
`workers: 2` did *not* fix it, so don't reflexively lower workers for
every flake; check whether it's actually concurrency-related first.

**User-requested**: improved `TextTransition`/`NumberTransition`'s
animations — `crossfade` gained a subtle scale, `vertical`/`horizontal`
switched to `springs.snap` (spatial move → spring, per `MOTION_SPEC.md`),
`NumberTransition` gained forced `tabular-nums`. No API changes, fully
backward compatible.

## Update (2026-11-18): Accordion — Family C at 5/17

Built on Base UI's `Accordion`. Confirmed each accordion part's own
exact "is-open" attribute individually (Trigger: `data-panel-open`;
Item/Panel: `data-open`) — they differ *within the same component*, not
just across components, reinforcing the "check every part's own
`*DataAttributes.d.ts`" rule from the `Tabs` entry above.

Found that Base UI's Accordion has **no roving-tabindex arrow-key
navigation between triggers** — it was removed following an ARIA APG
guidance update (accordion headers are now plain Tab stops, not a
composite widget; `orientation`/`loopFocus` are `@deprecated` and no
longer affect focus behavior). If you're about to write a keyboard test
for a new Family C component, don't assume arrow-key navigation exists
just because `Tabs`/`SegmentedControl`/`RadioGroup` have it — check the
Base UI docs/types for that specific primitive first.

## Update (2026-11-18): Dialog — Family C at 6/17

Added `Dialog` (modal, focus trap, backdrop). Avoided a real class of
bug before it shipped: don't center a popup with `transform: translate
(...)` when `OptionPopupSurface` also animates that element's `scale` —
Motion writes `transform` directly and will silently clobber a
CSS-set one rather than compose with it (this is exactly what went
wrong with `Slider`'s geometry, documented earlier). Use fixed-inset +
`margin: auto` centering for any future centered popup instead — no
transform needed, nothing to collide.

## Update (2026-11-18): AlertDialog — Family C at 7/17

Added `AlertDialog` (reuses `Dialog`'s CSS; distinct Base UI primitive).
Clean pass, no new bugs — the `Dialog` transform-collision and
`Tabs`/`Accordion` per-part-attribute lessons were applied up front.

## Update (2026-11-18): ContextMenu, HoverCard — Family C at 9/17

Added `ContextMenu` (reuses `DropdownMenu`'s item type/CSS) and
`HoverCard` (Base UI's actual name is `PreviewCard` — search for that if
`HoverCard` doesn't turn up in `node_modules`). **New gotcha**: not
every popup-based Base UI primitive supports the `actionsRef`/
`preventUnmountOnClose` retention pattern used by `Menu`/`Select`/
`Dialog`/`AlertDialog`/`Tooltip`/`Popover` — `ContextMenu.Root` doesn't
have it (`tsc` caught this immediately when copy-pasting the pattern).
Check the specific Root's prop types before assuming every new overlay
component supports it.

## Update (2026-11-18): Breadcrumbs, Pagination, Stepper — Family C at 12/17

Added the three remaining pure-presentational Family C components (no
Base UI primitive exists for any of them — plain semantic HTML, not a
Base UI wrapper): `Breadcrumbs` (`<nav>`+`<ol>`, last item is
`aria-current="page"` text, earlier items are real `Link`s when they
have an `href`), `Pagination` (bounded button count — first/last/
current±1 + ellipsis, never a flat row of every page number, built on
`IconButton` for prev/next), `Stepper` (wizard-style progress list,
complete/active/upcoming via `aria-current="step"`, horizontal or
vertical).

**New gotcha (10th)**: a CSS custom property reference to a token that
doesn't exist (`var(--b4-nonexistent)`) resolves to nothing silently —
no build error, no typecheck error, and it can even *look* fine in a
quick visual glance depending on what it's layered over. First drafts
of `Pagination.css`/`Stepper.css` invented `--b4-accent-solid`,
`--b4-surface-hover`, `--b4-surface-raised` (none exist in
`packages/tokens/src/*.css`) instead of the real `--b4-accent`,
`--b4-control-bg-hover`, `--b4-surface-2`. The only thing that caught it
was axe's `color-contrast` rule flagging a real 1.04:1 white-on-white
violation on Porcelain during the Playwright run. **Always grep
`packages/tokens/src/{base,theme-graphite,theme-porcelain}.css` for the
exact token name before writing `var(--b4-...)` in a new component's
CSS** — don't assume a plausible-sounding name exists just because a
similarly-named one does (e.g. `--b4-text-on-accent` is real,
`--b4-accent-solid` is not).

## Update (2026-11-18): NavigationMenu — Family C at 13/17

Added `NavigationMenu`, built on Base UI's own `navigation-menu`
primitive. **New gotcha (11th)**: once any section is open, hovering a
sibling trigger switches the active section immediately (Base UI's
`NavigationMenuTrigger` opens "when hovered or clicked" — restMs is 0
once the popup is already mounted). A `.click()` on that sibling
trigger therefore lands on a trigger that hover *already* made active,
and `useClick`'s `toggle: isActiveItem` then treats that click as a
close, not an open — so "click a second top-level nav trigger while the
first is open" closes the whole menu instead of switching, every time.
This is intended behavior (switching is a hover interaction once the
menu is open; clicking the active trigger again is how you close it),
not a bug — confirmed by tracing real `aria-expanded` timestamps in a
real Chromium browser with a throwaway `MutationObserver` debug script,
not by guessing. **When writing an interaction test against any Base
UI trigger whose docstring says "opens when hovered or clicked," don't
assume click-to-click switching between siblings is the right
assertion — check whether hover already does the switching once the
first one is open, and test that instead.**

## Update (2026-11-18): Drawer — Family C at 14/17

Added `Drawer`, built on Base UI's own `drawer` primitive (right-edge
side panel, real swipe-to-dismiss). **New gotcha (12th)**: the
`actionsRef`/`preventUnmountOnClose`/manual-`unmount()` pattern used by
`Dialog`/`AlertDialog`/`ContextMenu` is specifically for coordinating
with an *externally driven* Motion exit animation — it is NOT a
general-purpose "wait before unmounting" pattern to reach for by
default. Applying it to `Drawer` (whose exit is Base UI's own CSS
transition) left the popup stuck mounted with `data-closed` after
close in a real Playwright/Chromium run, because the manual
`unmount()` call raced Base UI's own internal, already-correct
CSS-transition-completion unmount timing. Removed it; plain `open`/
`onOpenChange` is correct for any CSS-only-transition component — see
`Accordion`/`Tabs`, which never needed the pattern either. **Only reach
for `actionsRef`/`preventUnmountOnClose` when Motion (not CSS) drives
the exit animation.**

## Update (2026-11-18): Sheet — Family C at 15/17

Added `Sheet`, sharing `Drawer`'s Base UI `drawer` primitive and CSS
(`swipeDirection="down"` instead of `"right"`, own positioning + a drag
grabber). Applied the Drawer gotcha (no `actionsRef`/
`preventUnmountOnClose` on CSS-only-transition components) up front —
first unit-test and e2e run both passed clean, zero follow-up fixes.
Worth noting as positive evidence for the "write gotchas down" habit:
the previous component's HANDOFF entry paid for itself immediately.

## Update (2026-11-18): CommandPalette — Family C at 16/17

Added `CommandPalette`: a real Base UI `Dialog` + `Combobox` in its
documented `inline` mode. **New gotcha (13th)**: `preventUnmountOnClose()`
and `actionsRef`/`unmount()` are two halves of ONE pattern — calling
`preventUnmountOnClose()` without also wiring an `actionsRef` and
calling `.unmount()` from the exit-animation-complete callback leaves
the popup **permanently** stuck mounted with `data-closed` after every
close. This happened here from copy-pasting `Dialog.tsx`'s
`onOpenChange` handler without also copying its `actionsRef`/
`OptionPopupSurface.onExitComplete` wiring. Confirmed via a real
Chromium run checking the popup element's own `data-*` attributes
after close, not guessed. **Whenever you see `preventUnmountOnClose()`
being called, grep the same component for where `.unmount()` is
actually invoked — if there isn't one, that's the bug, every time.**

## Update (2026-11-18): TreeView — Family C complete, 17/17

Added `TreeView`, built entirely from scratch (no Base UI primitive
for trees exists): real `tree`/`treeitem`/`group` ARIA roles with
genuine nested `<ul role="group">` subtrees, roving tabindex, and the
full ARIA APG tree keyboard pattern. **Three new gotchas, in the order
they were found and fixed:**

**Gotcha 14 — keydown bubbles through every ancestor treeitem.**
Nesting a subtree's `<ul role="group">` *inside* its parent `<li
role="treeitem">` (the correct, standard tree markup) means a keydown
fired on a descendant bubbles up through every ancestor's own
`onKeyDown` too. Any composite widget you build with this nested-row
shape needs an `event.currentTarget !== event.target` guard at the top
of its key handler, or an ancestor's handler will re-process (and
override) a key the focused descendant already handled. This doesn't
come up in Menu/Select/Tabs/Accordion because none of them nest an
interactive row inside another interactive row — TreeView is the first
component in this repo with that shape.

**Gotcha 15 — `aria-hidden` on anything with a non-negative-or-"-1"
tabindex is invalid, and breaks tooling too.** A `<button
tabIndex={-1} aria-hidden="true">` is a WAI-ARIA conformance violation
(aria-hidden is forbidden on any focusable element, and `tabIndex={-1}`
elements ARE still focusable via `.focus()`, just not via Tab) — but
the more immediate symptom was that Playwright's `getByRole('button',
{ hidden: true })` returned **zero** matches for it, globally, not just
scoped. If a `getByRole` query for a decorative/hidden interactive-
looking element comes back empty even with `hidden: true`, check
whether the element is BOTH focusable (has any tabindex, or is a
native button/link/input) AND `aria-hidden` — that combination is
invalid and tooling may not handle it predictably. Fix: make the
element genuinely non-focusable (a `<span>`/`<div>` with no tabindex,
not a native interactive element) if it truly should be hidden from
assistive tech.

**Gotcha 16 — a named descendant's own accessible name folds into its
ancestor's name-from-content.** Giving an inner element its own
`aria-label` (even a small decorative one like "Expand"/"Collapse")
changes the *ancestor's* computed accessible name too, confirmed via
`locator.ariaSnapshot()` in real Chromium
(`treeitem "src"` became `treeitem "Collapse src"`). Conversely, trying
to override the ancestor's own name with an explicit `aria-labelledby`
pointing at just its own label (to exclude a nested subtree's content)
tripped axe's `label-content-name-mismatch` rule instead, because the
descendants' visible text wasn't reflected in the overridden name.
**The actual correct behavior needs neither override**: real browsers'
accname algorithm already excludes nested `role="treeitem"` content
from an ancestor's name-from-content on its own — the bug was adding a
second named, focusable element (the disclosure control) competing for
that same name computation, not the lack of an explicit label.
Confirmed this is the real, intended behavior (not a workaround) by
checking axe and a real accessibility snapshot BEFORE writing the fix,
not by guessing which override would make a test pass.

**Related, jsdom-specific**: unlike real Chromium, jsdom's
`dom-accessibility-api` (used by `@testing-library/dom`) does **not**
exclude a nested treeitem's content from its ancestor's computed name —
`getByRole('treeitem', { name: 'src' })` fails in a *unit* test the
moment "src" has visible children, even though it's correct and passes
in both axe and real-Chromium Playwright tests. Matched with a prefix
regex (`{ name: /^src/ }`) in the unit tests rather than changing
correct, already-verified markup to satisfy a test-environment gap —
see `QUALITY_MATRIX.md`'s TreeView section for the full trail.

**Family C — Navigation & Overlays is now complete: 17/17 VERIFIED.**
Full gate: typecheck 4/4, @b4/react tests 242/242, build, Storybook
build, playwright 189/189 (run twice).

## Update (2026-11-18): DatePicker — Family B, first of the last 4

Added `DatePicker`: a real ARIA APG "Date Picker Dialog" grid wrapped
in the existing `Popover` component (reused, not rebuilt). **New
gotchas:**

**Gotcha 17 — a cross-*state-dependent-render* focus move needs a
`useEffect`, not a synchronous call or `requestAnimationFrame`.**
`TreeView`'s roving-focus fix (call `.focus()` synchronously right
after `setState`, since `.focus()` works regardless of an element's
current `tabindex`) only works when the target element **already
exists** in the DOM before the state change — i.e., when the state
change doesn't alter which elements render. `DatePicker`'s PageUp/
PageDown changes `visibleMonth`, which re-renders an entirely
*different set* of day buttons; the target date's button doesn't exist
yet in the same tick as the `setVisibleMonth` call, because React
flushes the re-render after the event handler returns, not
synchronously mid-handler. `requestAnimationFrame` (tried first, by
analogy to the already-fixed TreeView case) raced React's own
scheduling unpredictably here. The correct fix: a `useEffect` keyed on
the value that should receive focus, which by definition only runs
after the DOM reflects the state that triggered it. **Rule of thumb**:
synchronous focus-after-setState is safe only when the target element
was already rendered before the state change; if the state change
itself determines which elements exist, use `useEffect` instead.

**Gotcha 18 — "dimmed because it's from another month" is not the
same contrast exemption as "dimmed because it's disabled."** The
grid's adjacent-month days are fully real, clickable, selectable
buttons — clicking one navigates to that month and selects it — so
styling them with `--b4-text-disabled` (which axe/WCAG implicitly
tolerate failing contrast on, since genuinely disabled controls are
exempt) was a real `color-contrast` violation once a sighted-but-
low-vision user tried to read "11" at 2.43:1. Any "de-emphasized but
still interactive" text needs a token that actually passes AA
(`--b4-text-tertiary` here) — `--b4-text-disabled` is for elements
that are *actually* `disabled`/`aria-disabled`, not merely
visually quieter.

## Update (2026-11-18): TimePicker — Family B, second of the last 4

Added `TimePicker`: two real Base UI `NumberField` instances (hours,
minutes) composed directly with `NumberField.tsx`'s own internal
recipe, plus `SegmentedControl` for AM/PM. **New gotcha (19th)**:
every `NumberField.Input` (and likely every Base UI input rendered
inside a `Field.Root`) automatically picks up `aria-labelledby` from
the **ambient** `Field.Root` context — the surrounding `label` prop —
and this wins over the Input's own explicit `aria-label` regardless of
prop order, per the accname spec (`aria-labelledby` always beats
`aria-label` when both are present on an element). Composing more than
one such input inside a single outer `Field` (as any multi-segment
control — time, phone number, etc. — naturally would) means every
segment gets the SAME computed accessible name unless you explicitly
clear the ambient `aria-labelledby` on each one's rendered input
(`aria-labelledby={undefined}` in the `render` callback, after
spreading the base props) so its own `aria-label` takes over. **Check
for this whenever composing more than one Base-UI-Field-aware input
inside one outer `Field` wrapper.**

Also caught a real bug before writing a single test: the first draft
had no internal `useState` fallback for the uncontrolled case
(`current = value ?? defaultValue ?? {...}` reads `defaultValue` as a
constant, never updating it) — an uncontrolled `TimePicker` would
never respond to interaction at all. Fixed by adding the standard
controlled/uncontrolled pattern every other stateful component in this
library already follows. **When building a new stateful component,
check it against that pattern before writing tests, not after a test
reveals it's missing** — this one was caught by re-reading the
component's own logic, not by a failure.

## Update (2026-11-18): ColorPicker — Family B, third of the last 4

Added `ColorPicker`: a real draggable + keyboard-operable saturation/
brightness area, a real Base UI `Slider` reused for hue, a hex text
field synced both ways, real HSV↔RGB↔hex math. Every lesson from
DatePicker/TimePicker applied up front — standard controlled/
uncontrolled state from the start, composing `TextField`/`Popover`/the
raw Base UI `Slider` directly instead of reinventing them, watching
for the ambient-`aria-labelledby` trap before it could bite. Result:
every unit test, the build, and every e2e test (including real
`page.mouse` pointer drags on both the 2D area and the hue slider)
passed on the first run — no new gotchas this time, which is itself
worth recording: the investment in writing down gotchas 17-19 for
DatePicker/TimePicker paid for itself immediately on the very next
component.

## Update (2026-11-18): FileUpload — Family B complete, all 19/19

Added `FileUpload`: a real dropzone (native `<input type="file">`
positioned over the whole visible area, real `accept`/`maxSizeBytes`/
`maxFiles` validation, a real file list with removal). **New gotcha
(20th), and an important one**: "drop a file onto a native `<input
type="file">` and the browser will populate its `.files` for you" is
**true only for a genuine, trusted, OS-level drag** — a scripted/
synthetic `drop` `DragEvent` (the only way to exercise this in an
automated test) does **not** trigger that native behavior, because
browsers correctly refuse to set a file input's `.files` from an
untrusted event, for security reasons. The first draft of this
component relied on exactly that untested assumption; the Playwright
e2e drag-and-drop test caught it immediately (the dropped file never
appeared). Fixed by switching to a real `onDrop` handler reading
`event.dataTransfer.files` directly — the standard mechanism every
real drag-and-drop uploader library actually uses, and also the more
honest one: it doesn't depend on event trust, so the same code path
handles a real human drag and a test-dispatched one identically.
**Any future component that wants "native browser behavior" to do
something for free should get that claim verified by an e2e test
before relying on it, especially around file APIs, clipboard, and
other browser features gated behind user-trust/security checks.**

**Family B — Inputs & Forms is now complete: all 19 components
VERIFIED**, closing out the full component families' two largest
remaining categories this session (Family C: 17/17, Family B: 19/19).
Full gate at every step: typecheck → unit tests → build → Storybook
build → Playwright (both themes, run twice) before marking anything
VERIFIED, no exceptions, matching every component above.

## Update (2026-11-18): Spinner — Family E at 4/11

Added `Spinner`, extracted from `Button`'s existing inline spinner
design (same CSS, standalone, `role="status"` + `aria-label`). No new
gotchas — straightforward, matched the plan in the previous entry's
"Next action" note exactly.

## Update (2026-11-18): Toast — Family E at 5/11, real pre-existing Button bug found and fixed

Added `Toast` (real Base UI `Toast` system: `ToastProvider` +
`useToast()`, swipe-to-dismiss, priorities, `promise()`). **New
gotcha (21st), and a genuinely important one**: Graphite theme's
`--b4-accent-hover` had 2.92:1 contrast against white text — a real
WCAG AA failure that's been in the codebase since Phase 0, caught
only now because `e2e/toast.spec.ts`'s axe scan happens to run right
after clicking a primary `Button`, with the cursor still resting on
it (Playwright doesn't move the mouse away after `.click()`), so the
scan checks the `:hover` background, not just the resting one. Fixed
by splitting `--b4-accent-hover-fill` out as its own token instead of
aliasing `--b4-accent-400`, which is ALSO used (in the opposite
contrast direction — light text on a dark surface, not white text on
a light fill) by `--b4-accent-text`/`Badge`. **No single color token
can satisfy both "readable as fill behind white text" and "readable
as text in front of a dark surface" — check which direction a shared
token's contrast runs before reusing it for a second purpose,** and
remember that **an axe scan run right after a `.click()` checks the
clicked element's `:hover` state**, which most of this session's
axe scans (run on page load or after a different interaction) never
exercised.

## Update (2026-11-18): InlineAlert — Family E at 6/11

Added `InlineAlert`: persistent page-level message, four tones each
with a distinct icon, reusing `Badge.css`'s exact tone-token triad.
No new gotchas — clean first-run pass, matching the pattern of
components built right after a gotcha-heavy one (same as
ColorPicker following DatePicker/TimePicker).

## Update (2026-11-18): NotificationPanel — Family E at 7/11

Added `NotificationPanel`: a persistent notification list in a
popover, built on the existing `Popover`. **New gotcha (22nd)**:
`Popover`'s (and presumably `Dialog`'s/any similar component's)
`trigger` prop clones the element it's given with Base UI's own
Trigger handlers — pass a wrapper *component* instead of the actual
trigger element (e.g. `function Trigger() { return <IconButton
.../>; }` then `trigger={<Trigger />}`) and every click silently does
nothing, because cloning props onto a component doesn't forward them
to what that component renders. Always pass the real element to a
`trigger` prop, never a component around it — this cost a full
test-debugging cycle (all 6 unit tests failed identically) before the
cause was found.

**Also the 4th occurrence this session** of the `--b4-text-disabled`-
on-non-disabled-text mistake (Pagination/Stepper, DatePicker's
outside-month days, now NotificationPanel's timestamps) — grep
`packages/tokens/src/*.css` for the real token name before writing
`var(--b4-...)`, every single time, not just when a scan happens to
catch it. This has now cost 4 separate rebuild+retest cycles across
the session for the exact same category of mistake.

## Update (2026-11-18): MorphingSurface — Family E at 8/11

Added `MorphingSurface`: real FLIP-based morph via Motion's `layout`/
`layoutId`, the general-purpose counterpart to `AnimatedIndicator`. No
new gotchas — clean first-run pass.

## Update (2026-11-18): ExpandingAction — Family E at 9/11

Added `ExpandingAction`: real `layout`-driven hover/focus width
expansion, confirmed via e2e `boundingBox()`. **Correction, not a new
gotcha**: don't assume jsdom "never runs a real animation frame" (the
caveat recorded for `TextTransition`/`Popover`/`Dialog`) applies
everywhere without checking — here, Motion's exit animation *does*
eventually resolve in jsdom, just not synchronously with the
triggering event; `waitFor` was all that was needed. Test the
assumption before writing around it.

## Update (2026-11-18): TransitionGroup — Family E at 10/11

Added `TransitionGroup`: real enter/exit list via `AnimatePresence`
`mode="popLayout"`. **New gotcha (23rd)**: Storybook's preview iframe
keeps its own error-boundary markup in the DOM **always**, not just
when an error happens — invisible (not actually displayed) but still
matched by a bare tag locator like `page.locator("li")` or
`page.locator("button")`, since Playwright's locator counting doesn't
filter by visibility by default. Confirmed by dumping every matched
element's `outerHTML` in a throwaway debug script rather than guessing
— found real Storybook "Missing Context/Providers" / "Misconfigured
Webpack" boilerplate `<li>`s mixed in with the actual component's own
3 items (reporting 5, then 8, as more polling happened). **Always
scope an e2e locator counting generic elements (`li`, `button`, `div`,
etc.) to the component's own class or a `data-testid`, never a bare
tag selector against a Storybook iframe page** — this is the kind of
false-positive-looking failure that could easily be mistaken for a
real component bug without checking the actual matched DOM first.

## Update (2026-11-18): LoadingOverlay — Family E complete, all 11/11

Added `LoadingOverlay`: a real blocking overlay, proven with a real
e2e test (a `window.alert()` on the covered button, listened for via
Playwright's `dialog` event — no alert while visible, fires once
hidden). Reuses `Spinner` directly. No new gotchas.

**Family E — Feedback & Motion is now complete: all 11 components
VERIFIED**, closing out the third full component family this session
(after Family C: 17/17 and Family B: 19/19). Full gate at every step
throughout, no exceptions.

## Update (2026-11-18): Progress, CircularProgress — Family D started, 2/15

Added `Progress`/`CircularProgress`: real Base UI `Progress`
primitives (not a styled div with no ARIA). `CircularProgress` proves
Base UI's `Progress.Track`/`Indicator` are visual-agnostic — reused
`Root`/`Label`/`Value` for ARIA, rendered a genuine SVG
`stroke-dashoffset` ring computed from the same `value`/`min`/`max`
props rather than relying on Base UI's own linear-bar width styling.
No new gotchas.

## ResourceMeter — Family F's 8th component (2026-11-19)

**VERIFIED**. A current resource level (storage used, CPU, quota) —
distinct from `Progress` (Family D), which represents an in-progress
*operation*, not a static level. Uses the ARIA `meter` role on a
custom-styled element (`aria-valuenow`/`min`/`max`/`valuetext`), not
the native `<meter>` element — its cross-browser styling is too
inconsistent to theme reliably across B4's density/contrast axes, the
same reasoning `Progress`/`CircularProgress` already applied for
`role="progressbar"` over native `<progress>`. Tone auto-computes from
percentage (≥90% danger, ≥75% warning, else neutral) with an explicit
`tone` prop to override it.

**Caught a real token-guessing mistake before it ever shipped**: the
fill's CSS `transition` first referenced `var(--b4-duration-moderate,
240ms)` — a name that sounded entirely plausible (it reads like it
should exist alongside `--b4-duration-fast`/`--b4-duration-slow`) but
doesn't; the inline fallback value silently masked that it was
missing, since the rule still "worked" visually. Caught by grepping
the real token names in `packages/tokens/src/base.css` before trusting
the guess, per the project's standing rule — fixed to the actual
`--b4-duration-base`. This also means the transition now genuinely
collapses to `0ms` under `data-b4-motion="reduced"` the way every
other animated component here does; the fallback-value version would
have silently kept animating at `240ms` regardless of the reduced-
motion setting; and been invisible to any test, since nothing asserts
transition duration directly.

Full gate: typecheck, @b4/react tests 450/450, build, Storybook build,
playwright 351/351 (run twice). Family F now: 8/10.

## ResizablePanels — Family F's 7th component (2026-11-19)

**VERIFIED**. No Base UI primitive for this — built from scratch on
the WAI-ARIA interactive-`separator` pattern (`role="separator"`,
`aria-orientation`, `aria-valuenow`/`min`/`max`, focusable). Genuinely
resizable two ways: pointer drag (tracked via `pointermove`/
`pointerup` listeners on `window` after `setPointerCapture` on the
divider, computing the new split from the container's real
`getBoundingClientRect()`) and keyboard (arrow keys step the split;
`Home`/`End` jump to the configured min/max) — not a fixed-width
layout with a decorative line between panels.

**Verification deliberately split across layers to match what each
can actually exercise**: keyboard-driven resizing is geometry-
independent (pure component state logic), so it's tested directly in
the unit suite, which jsdom handles fine. Pointer-drag resizing needs
real layout — jsdom's `getBoundingClientRect()` always returns zeroes
— so that path is covered only by the real-browser e2e test (a
genuine `page.mouse.down()`/`move()`/`up()` sequence asserting the
resulting `aria-valuenow`), plus a live manual drag confirmed in the
browser pane before either was written. **Lesson**: don't try to force
pointer-geometry interactions into jsdom unit tests — recognize which
layer can actually prove the behavior and put the test there instead
of writing a unit test that would pass vacuously.

Also worth noting: the divider's actual drag/click hit target is wider
than its 1px visible line — a `::before` pseudo-element extends it ±4px
without affecting panel layout math, since a literal 1px pointer
target would be unusable. Checked this visually in the browser, not
just assumed it from the CSS.

Full gate: typecheck, @b4/react tests 443/443, build, Storybook build,
playwright 348/348 (run twice). Family F now: 7/10.

## InspectorPanel — Family F's 6th component (2026-11-19)

**VERIFIED**. A properties panel for a selected item — real
`<dl>`/`<dt>`/`<dd>` markup for each label/value pair (each pair
wrapped in its own `<div>`, which is valid per the HTML5 `<dl>`
content model and confirmed clean by axe both in unit tests and the
real browser), not a two-column `<div>` grid standing in for one.
Typically the right-hand pane of `ResizablePanels`. No component
gotchas this time — the only hiccup was a test-authoring mistake (a
fixture reused the same string for the panel title and a property
value, making `getByText` ambiguous), fixed by scoping the query.
Full gate: typecheck, @b4/react tests 437/437, build, Storybook build,
playwright 344/344 (run twice). Family F now: 6/10.

## FilterBar — Family F's 5th component (2026-11-19)

**VERIFIED**. A row of filter controls (`Select`/`SearchField`/
`Combobox`, passed in as `children` — this component is the layout
and the applied-filter chip trail, not another set of dropdown/input
primitives) plus a trail of removable chips showing what's currently
applied, reusing `Badge` for the chip rather than building a new label
component.

**Two real bugs, both worth remembering**:

1. Nesting `IconButton` inside each chip for the remove button would
   have badly overflowed it — `IconButton`'s smallest size
   (`--b4-control-height-sm`, 32px) is sized for standalone controls,
   while `Badge`'s own height is only ~22px. Caught by checking the
   actual token values *before* rendering anything, not after seeing
   it look wrong — fixed with a bare, chip-scaled `<button>` styled
   specifically for this one context. **Lesson**: when composing a
   smaller UI element inside an existing component, check the target's
   real dimensions against the element you're about to nest before
   writing the JSX, not after.
2. A real `aria-required-children` violation, caught by the unit axe
   check (not something eyeballing the DOM would obviously catch): the
   "Clear all" button was a direct child of the `role="list"`
   container alongside the `role="listitem"` chips — a list may only
   contain list items as direct children. Fixed by moving "Clear all"
   outside the list, as a sibling.

Full gate: typecheck, @b4/react tests 432/432, build, Storybook build,
playwright 341/341 (run twice). Family F now: 5/10.

## Toolbar — Family F's 4th component (2026-11-19)

**VERIFIED**. A real ARIA toolbar built on Base UI's `Toolbar.Root` —
genuine APG toolbar keyboard behavior (roving tabindex, arrow keys
move focus between items, Home/End to first/last), not a styled flex
row of buttons that only Tabs through in document order.
`ToolbarButton`/`ToolbarIconButton` wrap Base UI's `Toolbar.Button`
(for the roving-tabindex registration) via the `render` prop,
delegating all visual rendering to B4's existing `Button`/
`IconButton` — reusing the exact composition pattern `Checkbox`
already uses for a Base UI primitive with a custom look, rather than
hand-rolling focus management.

**New gotcha, worth remembering for any future `render`-prop wrapper
around a Motion-based B4 component**: `ToolbarButton`/
`ToolbarIconButton`'s own prop types could NOT simply extend `Button`/
`IconButton`'s full prop types — those are Motion-flavored
(`HTMLMotionProps<"button">`, with `style` typed as Motion's
`MotionStyle`), and Base UI's `Toolbar.Button` expects a plain
`<button>`-shaped prop set (`style?: CSSProperties`), so spreading the
Motion-typed rest props onto it failed to typecheck (`style`/
`accentColor` mismatches surfaced first, since those are where the
two type shapes diverge most visibly). Fixed by giving the Toolbar
item components their own plain-HTML prop interfaces
(`ComponentPropsWithoutRef<"button">`-based) instead of inheriting
`Button`/`IconButton`'s prop types directly — the underlying
`Button`/`IconButton` still gets its own Motion press feedback
internally via its own component code; only the *public* prop surface
of the Toolbar wrapper is plain. `ToolbarIconButton` also needed
`aria-label` to stay genuinely required at the type level, so it's
explicitly destructured from the wrapper's own props and threaded to
both `Toolbar.Button` and the underlying `IconButton` by hand, rather
than relying on it flowing through an untyped spread.

Real arrow-key roving-tabindex navigation confirmed three separate
ways before calling it done: a unit test, a real-browser e2e test, and
a live manual check in the browser pane (clicked Bold, pressed
ArrowRight twice, confirmed focus actually landed on "Insert link").

Full gate: typecheck, @b4/react tests 426/426, build, Storybook build,
playwright 337/337 (run twice). Family F now: 4/10.

## PageHeader — Family F's 3rd component (2026-11-19)

**VERIFIED**. The title block at the top of a page's content area —
composes `Breadcrumbs` and `Button`/`ButtonGroup` (`breadcrumbs`/
`actions` slots) rather than reimplementing either. Renders `title` as
a real `<h1>` by default, since this is usually the page's one true
top-level heading; `headingLevel` overrides it for a nested context
where `<h1>` would be wrong. Distinct from `AppShell`'s `header` slot
— that one is persistent app chrome (a top bar), this one is page
content and scrolls with it. No new gotchas. Full gate: typecheck,
@b4/react tests 422/422, build, Storybook build, playwright 333/333
(run twice). Family F now: 3/10.

## Sidebar — Family F's 2nd component (2026-11-19)

**VERIFIED**. The content that typically fills `AppShell`'s `sidebar`
slot — real `<a>`/`<button>` items in normal tab order (not a
composite ARIA widget; this is ordinary page navigation), grouped into
optional-label sections. Active item gets a real surface
(`--b4-control-bg-selected`/`--b4-control-fg-selected`), reusing the
same selection tokens SegmentedControl/ToggleButton/Tabs already use,
not a one-off color. No new gotchas. Full gate: typecheck, @b4/react
tests 416/416, build, Storybook build, playwright 330/330 (run twice).
Family F now: 2/10.

## AppShell — Family F's first component (2026-11-19)

**VERIFIED**. The page-level layout scaffold the rest of Family F (and
real pages) compose inside — real `<header>`/`<nav>`/`<main>`
landmarks, not `<div>`s. `header` is fixed-height and spans the full
width; `sidebar` and the main content area each fill and scroll within
the remaining viewport height independently. The sidebar landmark is
omitted entirely (not rendered with an empty accessible name) when no
`sidebar` prop is passed — a page using only `header`+`children`
shouldn't get a spurious empty `<nav>` landmark. No new gotchas. Full
gate: typecheck, @b4/react tests 411/411, build, Storybook build,
playwright 326/326 (run twice). Family F now: 1/10.

## Calendar — Family D's 15th and final component (2026-11-19)

**VERIFIED. Family D — Data & Content is now complete: all 15/15
components VERIFIED.** A real read/display month calendar for browsing
a schedule, events laid out on a day grid — distinct from `DatePicker`
(a popover-based input picker for a single form value, not page
content). Reuses `DatePicker`'s month-grid date math: extracted into a
new shared module, `packages/react/src/internal/monthGrid.ts`
(`sameDay`, `startOfMonth`, `addMonths`, `addDays`, `buildMonthGrid`,
`WEEKDAY_LABELS`, `monthYearFormatter`, `dateFormatter`), and
`DatePicker.tsx` was refactored to import from it too — confirmed with
no regression (`DatePicker.test.tsx` still 7/7). Same ARIA APG grid
pattern as DatePicker (`role="grid"`/`"row"`/`"gridcell"`, roving
tabindex, arrow-key/PageUp/PageDown/Home/End). The keyboard-handling
*glue* itself (not the date math) stays duplicated between the two
components on purpose — DatePicker closes a popover and respects a
min/max range on commit, Calendar does neither, so forcing a shared
hook onto two different interaction models would have been the wrong
kind of reuse; copying ~25 lines of arrow-key-delta logic by the same
established pattern is the honest trade-off here.

**Two real accessibility bugs found by the actual e2e axe pass, not
assumed away by the unit tests, both worth internalizing**:

1. **WCAG 2.5.3 "Label in Name".** The first version put a full
   `aria-label` (e.g. `"Saturday, November 21, 2026, 4 events"`) on
   each day button while that same button also rendered real, visible
   event-label text ("Standup", "Launch review", …) as actual content.
   An `aria-label` REPLACES the whole computed accessible name — it
   doesn't add to it — so the visible event text silently dropped out
   of what a screen reader or voice-control tool exposes. A sighted
   voice-control user who sees "Standup" printed on the day has no way
   to say "Standup" and have it invoked, because the name no longer
   contains those words. `axe-core`'s `label-content-name-mismatch`
   rule flagged it immediately (serious impact) the moment the real
   browser e2e check ran. **Fixed** by dropping the `aria-label`
   entirely and instead placing a visually-hidden (CSS-clipped, NOT
   `aria-hidden`) span with the full weekday/month/day/year context as
   genuine content inside the button, ahead of the visible day number
   and event labels — the accessible name now computes naturally from
   everything actually on screen (plus the hidden context), so nothing
   visible is ever excluded from it. **Lesson for future components**:
   `aria-label` on an element that also has meaningful visible child
   content is a trap — it silently discards that content from the
   accessible name. Prefer letting the name compute naturally from
   visible content, supplementing with visually-hidden (not
   `aria-hidden`) text for extra context, or `aria-describedby` for
   genuinely separate supplementary information.
2. **A real WCAG AA contrast failure from reaching for `opacity`
   instead of a token.** Outside-month days were dimmed with
   `opacity: 0.5` on the whole button. Opacity washes out whatever's
   underneath unpredictably depending on the real surface behind it —
   on Porcelain this measured 3.53:1 against the required 4.5:1,
   caught by axe (serious impact). `DatePicker` had already solved
   "de-emphasized day" correctly, with `--b4-text-tertiary` (a token
   already tuned and contrast-verified for exactly this purpose) — so
   this was a `[[reuse, don't recreate]]` miss, not a genuinely new
   problem. Fixed by applying `--b4-text-tertiary` to the day-number
   text directly instead of dimming the whole button.

Both fixes were confirmed by actually re-running the real e2e axe
check afterward, not just reasoned about and assumed fixed.

Full gate: typecheck, @b4/react tests 407/407 (including DatePicker's
unchanged 7/7 post-refactor), build, Storybook build, playwright (2
clean full passes, 322/322 each — no flakes this run, unlike the
previous few components).

**Family D — Data & Content: 15/15 VERIFIED. Complete.** Next up:
Family F (`AppShell`, `Sidebar`, `PageHeader`, `Toolbar`, `FilterBar`,
`InspectorPanel`, `ResizablePanels`, `ResourceMeter`, `FileExplorer`,
`QueryEditor`) — see the dedicated "Next action" note below.

## DataGrid — Family D's 14th component, the hardest in the family (2026-11-19)

**VERIFIED** as a genuinely real virtualized/sortable/filterable grid
per the mission brief's explicit bar — not a styled `<table>` capped
by `overflow`. Uses ARIA `grid`/`row`/`columnheader`/`gridcell` roles
over a div-based layout, not a native `<table>` — a real `<table>`
requires every `<tr>` to be a contiguous DOM child, which doesn't
compose with windowed rendering, where only the scrolled-into-view
rows (plus a small overscan buffer) actually exist in the DOM at any
time. Verified this is real, not simulated, two ways: a unit test
asserting the DOM row count stays small against 200 rows, and a
real-browser e2e test doing the same against 500 rows via
`document.querySelectorAll`.

Sort and filter are genuinely internal, driven by each column's
`getValue: (row) => string | number` accessor — a deliberate departure
from `DataTable`'s controlled-only, render-output-only design.
`DataTable` can't sort/filter for real because it only sees each
column's *rendered* JSX; `DataGrid` can, because `getValue` hands it
the real typed value. This is the actual reason the two components
have different architectures, not just different feature sets.

**Real UX bug found via the browser pane, not caught by anything
written down as a requirement**: sorting or filtering while scrolled
partway down left the scroll position untouched, so the new,
re-ordered/shrunk row set rendered starting from wherever the user
happened to be scrolled — this reads as "I clicked sort and nothing
happened" (you're still looking at rows 100-117 of the old list,
which now correspond to the WRONG rows of the new sorted/filtered
set) rather than as a list that's scrolled past its own top. Caught by
actually sorting the grid in the browser pane after scrolling it,
watching the row contents, and noticing they were still mid-alphabet
instead of starting at the top. Fixed by resetting both the React
`scrollTop` state driving the windowing math AND the real DOM
element's `.scrollTop` on every sort/filter change, confirmed visually
before and after, plus a dedicated unit test and e2e test asserting
`scrollTop === 0` after a sort. **Lesson**: any component with
internal scroll position tied to derived data (sorted/filtered/
paginated) needs to explicitly decide what happens to that scroll
position when the derivation changes — "nothing" is rarely the right
answer, and nothing in the unit-test-first workflow would have
surfaced this without actually driving it in a browser.

Also caught, mid-test-writing: `@testing-library/react`'s
`getByRole("textbox", …)` doesn't match `<input type="search">` — that
input's implicit role is `searchbox`, not `textbox`. Easy to miss since
the two look identical at a glance; fixed the test queries.

Full gate: typecheck, @b4/react tests 398/398, build, Storybook build.
**Playwright needed 4 full-suite passes to land the two clean ones**
this project's standard requires — recorded honestly:
- Pass 1: 3 single failures (`dropdown-menu.spec.ts`,
  `form-controls.spec.ts`'s PasswordField axe check,
  `interactive-card.spec.ts`'s axe check).
- Pass 2: clean, 316/316.
- Pass 3: 1 single failure (`drawer.spec.ts`'s axe check).
- Pass 4: clean, 316/316.

Every failure across all four passes was investigated immediately by
re-running that spec file alone with `--repeat-each` — every single
one came back 100% green in isolation (62/62, then 15/15). None was
ever a DataGrid spec. This is a real, recurring pattern — full-suite
parallel runs intermittently fail a small number of otherwise-solid,
pre-existing specs, never the same ones twice, never reproducible
standalone — and deserves a dedicated investigation rather than
continuing to just re-run until green each time. **Follow-up, not yet
actioned**: look into whether this is Playwright's 3-worker parallelism
causing resource contention (CPU/memory pressure affecting animation
timing, which several of the flaky specs' failures were axe-timing- or
animation-adjacent) — maybe worth trying `workers: 2` or a longer
default timeout for axe checks specifically, or just tracking the
flake rate over time to see if it's getting worse as the suite grows
(it's now 316 tests; it was under 100 earlier this session).

## DataTable — Family D's 13th component (2026-11-19)

**VERIFIED**. Real `<table>`/`<thead>`/`<tbody>`: sortable columns are
real `<button>` headers with `aria-sort` (not a clickable `<th>` div),
row selection reuses `Checkbox` including its genuine indeterminate
"select all" state. Sorting and selection are both fully *controlled*
(`sort`/`onSortChange`, `selectedIds`/`onSelectedIdsChange`) — DataTable
deliberately does not sort data internally, because it only knows each
column's rendered output, not the underlying value's real type, so
generic sorting would mean either demanding a per-column comparator or
silently `String()`-ing everything (worse). `DataGrid` is where
virtualized, in-component sort/filter belongs — this component is its
lighter, non-virtualized sibling.

**Real bug caught by the browser-pane check, not the automated gate**:
the `--end` alignment modifier classes
(`.b4-data-table__header--end`/`__cell--end`) were silently losing to
the base `.b4-data-table th, td` rule and staying left-aligned, because
that base rule has HIGHER CSS specificity (an element + class selector)
than the modifier (a single class) — source order doesn't save you from
a specificity loss. `getComputedStyle` in the browser pane showed
`textAlign: "left"` immediately; nothing in the unit or e2e suite was
asserting computed style before this, so it would have shipped
silently. Fixed by raising the modifier selectors' specificity
(`.b4-data-table th.b4-data-table__header--end`) and added a
dedicated e2e assertion on the real computed `text-align` so this
exact regression can't sneak back in unnoticed. **Lesson for future
components**: a CSS modifier class only wins if its specificity is
equal-or-higher than whatever it's meant to override — check this,
don't assume source order is enough, especially for any `.component
element, element` base rule (specificity (0,1,1)) paired with a
single-class modifier (0,1,0).

Also deliberately used `--b4-accent-subtle-bg` for the selected-row
tint, not `--b4-control-bg-selected` — the latter is tuned for a
strong, near-solid fill appropriate to a selected *control* (e.g. a
selected segmented-control tab), and would make a selected table row
nearly unreadable (confirmed this by checking what it actually renders
as in Porcelain: a near-black fill). Checked both themes visually
before committing to the choice.

**Playwright needed 4 full-suite passes to land two clean ones** —
worth recording honestly rather than quietly re-running until green
and saying nothing. Pass 1: clean, 309/309. Pass 2: one failure,
`dropdown-menu.spec.ts`'s "survives rapid repeated open/close" test.
Pass 3: a *different* single failure, `chart-container.spec.ts`'s axe
check. Both were investigated immediately: re-running each spec file
alone with `--repeat-each=3` came back fully green both times (3/3 and
12/12), meaning both are pre-existing, timing-sensitive flakes that
only surface under the full suite's parallel load — not regressions
introduced by DataTable, and not something DataTable's own commit
should carry the blame for. Pass 4: clean, 309/309. Full gate overall:
typecheck, @b4/react tests 389/389, build, Storybook build. Family D
now: 13/15 — only DataGrid and Calendar remain.

**Follow-up, not yet actioned**: `dropdown-menu.spec.ts`'s rapid
open/close test and `chart-container.spec.ts`'s axe-clean-on-graphite
test are both intermittently flaky under full-suite parallel load.
Worth a dedicated investigation pass (likely animation/timing-related,
given DropdownMenu's history in this file) before they cause confusion
in a future session that doesn't already have this context.

## ChartContainer — Family D's 12th component (2026-11-19)

**VERIFIED**. Chart chrome only — title, description, an actions slot,
and an accessible legend (swatch `aria-hidden`, paired with a real
visible text label, per DESIGN_PRINCIPLES.md's "color never carries
meaning alone" rule) — around whatever chart a consumer renders into
`children`. Deliberately no bundled charting library, same reasoning
as CodeBlock not bundling a tokenizer: keeps the package's dependency
footprint small, and a real chart implementation is squarely the
consumer's domain-specific choice (Recharts, D3, raw SVG, etc.), not
something a general component library should impose.

Before writing e2e, opened the Storybook story in the browser pane and
visually checked both themes — a direct continuation of the polish
check that caught CodeBlock's clipboard bug; this one had no surprises.
No new gotchas. Full gate: typecheck, @b4/react tests 381/381, build,
Storybook build, playwright 303/303 (run twice). Family D now: 12/15 —
the "simpler/self-contained" components (everything but DataTable,
DataGrid, Calendar) are now all done.

## CodeBlock — Family D's 11th component (2026-11-18)

**VERIFIED** — but two real bugs were found and fixed along the way,
both worth internalizing for future components:

1. **Uncaught clipboard rejection, caught by a live browser check, not
   the automated gate.** The first implementation did
   `await navigator.clipboard.writeText(code)` with no `try`/`catch`.
   Opening the Storybook story in the browser pane and clicking Copy
   showed `Uncaught (in promise) NotAllowedError` in the console and
   zero UI feedback — the button just sat there. Any environment where
   clipboard permission can be denied (cross-origin iframe, insecure
   context, no permission grant) would hit this. Fixed with a real
   `try`/`catch` and a third `"failed"` copy state (its own icon,
   `aria-label`, and `aria-live` announcement), auto-resetting after 2s
   via a `useEffect`-cleaned-up timer ref. **Lesson**: the automated
   gate (unit + e2e axe) doesn't catch "the happy path works but the
   failure path throws uncaught" — that needs an actual interactive
   check, which is why this one got caught at all.
2. **`userEvent.setup()` silently hijacks `navigator.clipboard`.**
   Writing the failure-path unit test exposed that
   `@testing-library/user-event`'s `setup()` installs its own
   `navigator.clipboard` stub (for its `copy()`/`paste()` helpers) the
   moment it's called — overwriting any mock defined beforehand. Both
   copy tests had been calling `userEvent.setup()` *after* mocking
   clipboard, so the "copies to clipboard" test had been passing
   against user-event's own always-resolving stub the whole time, not
   the test's mock — a false-positive the project hadn't had before.
   Fixed by moving the clipboard mock to *after* `userEvent.setup()` in
   both tests. **Lesson**: any future component test that mocks
   `navigator.clipboard` (or likely other browser APIs user-event
   also stubs) needs to set the mock up after `userEvent.setup()`, not
   before.

CodeBlock itself deliberately doesn't bundle a syntax-tokenizer
dependency — `language` is a plain display label, not something this
component tokenizes — to keep the package's dependency footprint
small; a consumer wanting real highlighting pre-renders tokenized
markup into `code` itself.

Full gate: typecheck, @b4/react tests 374/374, build, Storybook build,
playwright 299/299 (run twice — note: an earlier run during this same
component's work showed only 19 passed; that was a false reading from
killing a manually-started Storybook dev server sharing Playwright's
port mid-run, not a real failure, and was discarded in favor of a
clean re-run). Family D now: 11/15.

Also fixed a real doc inconsistency a later check surfaced: PROGRESS.md
had a phase-status table that still said "Family A DONE, Family B
mostly done" and "Family C STARTED (9/17)" — both had actually been
complete for a while (19/19 and 17/17 respectively, confirmed in
COMPONENT_INVENTORY.md), the table had just never been updated to match
the dated log entries underneath it. Fixed.

## Timeline, ActivityFeed — Family D's 9th and 10th components (2026-11-18)

**Both VERIFIED**. `Timeline`: chronological connected list of events,
per-item tone dot (`neutral`/`success`/`warning`/`danger`/`info`,
reusing the same tokens StatusBadge's dots use), connecting line drawn
via `::before` on the item element so it spans correctly regardless of
content height. `ActivityFeed`: its actor-attributed sibling, reuses
`Avatar` directly rather than reimplementing initials/image-fallback
logic. Both render as a real `<ol>`/`<li>` list. Kept as two separate
components rather than one with an optional-avatar prop — Timeline's
common case is a system event with no actor, so an avatar-shaped prop
would be the wrong default for it. No new gotchas. Full gate:
typecheck, @b4/react tests 367/367, build, Storybook build, playwright
294/294 (run twice). Family D now: 10/15.

## Stat, EmptyState, ErrorState — Family D's 6th, 7th, 8th components (2026-11-18)

**All three VERIFIED**. `Stat`: a labeled metric with an optional
`up`/`down`/`neutral` trend delta — reused `--b4-success`/
`--b4-danger-text` directly for the trend text color rather than
inventing new tokens; both themes' own doc comments already note these
were tuned for plain-text-on-surface contrast (distinct from
`--b4-success-bg`/`--b4-danger-bg`'s icon-on-tint job), confirmed by
the e2e axe pass on both themes.

`EmptyState`/`ErrorState` share the same "icon + title + description +
optional action" shape but were deliberately kept as two separate
components, not one with a `tone` prop: `ErrorState` is `role="alert"`
(assistive tech should announce a failure proactively), `EmptyState`
has no such role (a "no data yet" state isn't an alert) — a real
semantic difference, not just a color swap, so merging them the way
`InlineAlert`'s tones share one component would have been wrong here.

Full gate: typecheck, @b4/react tests 359/359, build, Storybook build,
playwright 288/288 (run twice). Family D now: 8/15.

## Card, InteractiveCard — Family D's 4th and 5th components (2026-11-18)

**Both VERIFIED**. `Card`: static content surface for Stat/EmptyState/
ErrorState to compose with — `flat`/`raised`/`outlined` variants, reused
the existing `--b4-surface-radius`/`--b4-shadow-raised` tokens rather
than adding new ones. `InteractiveCard`: its clickable sibling, a real
`<button>` (keyboard-operable, correct semantics for free), sharing
Button's `springs.snap` press feedback plus a small hover lift, both
skipped under `useReducedMotion()`. No new gotchas — tokens and the
established e2e page-isolation `disableRules` pattern both worked on
first try. Full gate: typecheck, @b4/react tests 343/343, build,
Storybook build, playwright 279/279 (run twice). Family D now: 5/15.

## Skeleton — Family D's 3rd component (2026-11-18)

**VERIFIED**. `aria-hidden` shimmer placeholder, `text`/`circle`/`rect`
variants. Purely decorative (unlike Progress/CircularProgress/Spinner's
genuine loading signal), so reduced motion drops the shimmer entirely
rather than just slowing it. One real bug found and fixed: the
width/height unit test used `toHaveStyle({ height: "2rem" })`, which
failed because jsdom resolves `"2rem"` against its own 16px default
root font-size when computing style — a jsdom quirk, not a component
defect — fixed by asserting `el.style.height` directly instead. Full
gate: typecheck, @b4/react tests 334/334, build, Storybook build,
playwright 272/272 (run twice). Family D now: 3/15.

## Next action: FileExplorer next, then QueryEditor last — the two
remaining Family F components, both explicitly flagged as needing
real, non-mockup functionality. QueryEditor in particular (real
syntax-aware editing, not a styled `<textarea>`) is probably the
single hardest component left in the whole inventory.

Family D is now complete (15/15 VERIFIED). Families A, B, C, D, E are
all fully VERIFIED. Family F is now at 8/10 (AppShell, Sidebar,
PageHeader, Toolbar, FilterBar, InspectorPanel, ResizablePanels,
ResourceMeter VERIFIED), and it's explicitly the most "layout
composition of other components" family — a natural last family, since it's
most likely to want things from Families A-D already in place
(`FileExplorer` wants `TreeView`, already VERIFIED; `QueryEditor` must
have real syntax-aware editing per the mission brief, not a styled
`<textarea>` — this is probably the single hardest component left in
the whole inventory and deserves a dedicated session, not a quick
build at the end of a long one).

Across all three: keep the full gate (typecheck → unit tests → build
→ Storybook build → Playwright, both themes, run twice) before marking
anything VERIFIED, and keep checking `packages/tokens/src/*.css` for
real token names before writing `var(--b4-...)` — gotcha 10
(Pagination/Stepper) is the single most-repeated mistake category this
session; grepping first costs nothing and the fix-after-axe-catches-it
cycle costs a full rebuild+retest loop every time it's skipped.

Family B still needs `DatePicker`, `TimePicker`, `ColorPicker`,
`FileUpload` — these are the most complex remaining Family B items
(calendar grid logic, color space math, drag-and-drop) and deserve real
scrutiny against "don't fake complex functionality," not a quick stub.
Family C is complete (17/17 VERIFIED). Next: Family B's last 4
(`DatePicker`, `TimePicker`, `ColorPicker`, `FileUpload` — the most
complex remaining Family B items, deserve real scrutiny against "don't
fake complex functionality," not a quick stub), then Families D/E/F
per the phased plan. Keep using the shared `Field` wrapper, `AnimatedIndicator`,
`TextTransition`/`NumberTransition`, `DropdownMenu`, `IconButton`, and
the internal helpers (`FieldControl`, `SteppingInput`,
`motionCompatibleProps`, `OptionPopupSurface`, `createItems` — check
`packages/react/src/internal/` before building something that
duplicates one of these). Full gate (typecheck → unit tests → build →
Storybook build → Playwright, both themes, run twice) before marking
anything VERIFIED, same as every component above. **When a
Storybook-driven e2e interaction mysteriously no-ops, check for an
uncaught exception from a missing required story prop before suspecting
the component** — see the SplitButton bug above. **Grep the real token
names in `packages/tokens/src/*.css` before writing any new `var(--b4-
...)` reference** — see the Pagination/Stepper gotcha above.

## Historical context below (superseded where it says "pending"/"blocked" — see above)

## Immediate continuation (latest, 2026-11-17)

User explicitly requested push after Switch refinement. Attempted git add --all
before commit/push; it failed creating .git/index.lock (Permission denied).
No new commit or push occurred. HEAD remains cae1a5c on main; working changes
are retained. Retry normal staging/commit/push when Git metadata is writable;
do not alter permissions or bypass the sandbox restriction.

Newest Switch refinement: replaced the physical translateX CSS tween with a
Motion layout-position thumb using springs.travel; root press uses snap. Layout
uses border-box dimensions and logical flex alignment, so RTL reverses travel
without a second offset. Selected track/thumb use neutral B4 control tokens;
shared 44px hit target, hover/focus/disabled states and forwarded button ref.
AllStates and RightToLeft stories added. Reduced motion disables layout travel.
Focused Switch tests 7/7, ESLint, workspace typecheck, package and Storybook
builds passed. Unit tests cover rapid keyboard toggles/ref/focus, controlled
rejection and native form data in addition to existing interaction/axe tests.

Real browser now works again: started pnpm storybook (exec session 56229), then
created a FRESH tab; the earlier connection-error tab was stuck on its data URL.
Global-settings/registry warnings were not fatal to this dev-server startup.
Do not keep claiming browser checks are universally blocked. Switch AllStates
screenshots inspected in Graphite and Porcelain. Measured 40x24 track / 20x20
thumb, 2px top/bottom inset, horizontal 2/18px off and 18/2px on in LTR.
Observed actual intermediate travel transforms, Space toggled correctly; eight
rapid Porcelain clicks ended off with exactly one thumb per switch. Porcelain
RTL reduced: off inset 18/2 reversed to 2/18 on, transform none immediately.
This is manual evidence, not a passing full CLI suite. Full modifier/mobile,
screen-reader and live axe checks for this revision remain pending; IMPLEMENTED.
Next verify latest Checkbox and Field stories using this working fresh-tab
workflow, then complete existing-component regression before expanding scope.

Newest request: Checkbox also needed visual/motion refinement. It now uses
neutral B4 selected tokens, snap press feedback, a persistent animated indicator
and drawn/morphing check-to-mixed path. Reduced motion uses duration zero.
Base UI owns checked state and form semantics; forwardRef targets the existing
button. Label/touch target is at least the shared hit-target token. Added
AllStates and Selection (derived Select all mixed state) stories.
Checkbox focused tests 9/9, ESLint, workspace typecheck, package build and
Storybook build passed. Three new tests cover controlled rejection, control/ref
identity and focus across mixed/checked/unchecked, and native form data.
No new real-browser checkbox evidence this turn; the last preview connection
was refused. Next inspect Checkbox/Selection and AllStates in both themes,
verify actual path/press frames and reduced motion, disabled/keyboard behavior,
live axe and responsive layout. Keep Checkbox IMPLEMENTED until the full gate.

Latest focused correction: Field/WithCustomControl and Field/WithError no longer
show an inline-styled native select. Both reuse B4 Select, which already owns
Field; do not nest another wrapper. Existing story IDs are preserved. Removed
the ad hoc selectStyle and clarified docs: Base UI Field.Control supplies label
semantics, not B4 dropdown visuals. ESLint, typecheck, React 124/124 and
Storybook production build passed.
Visual recheck of these two stories is next: localhost:6106 refused the browser
connection this turn. Storybook startup reported global-settings EPERM and a
runtime-registry warning. Do not reuse prior browser evidence for these changed
stories. Check both themes, keyboard selection, hint/error and reduced motion.

The user visually rejected the previous checkpoint. Read AUDIT_REPORT.md for
exact corrections and evidence. The whole plan is NOT complete. Twenty public
components exist; seventeen touched components are IMPLEMENTED pending a full
browser regression run. Do not use earlier VERIFIED claims as current proof.

Current checks: React 124/124, motion 5/5, typecheck, package build, Storybook
build all passed. Slider/Combobox were actually inspected through browser
control against the user's server. Slider geometry is correct at all five
specified widths in both themes; its AllVariants live axe scan reports zero
violations/inconclusive. Combobox has keyboard/filter/clear/scroll/exit and
both-theme viewport evidence, but its live axe scan has two inconclusive
results (details in report). CLI Playwright still cannot start here: settings
EPERM. Browser control works; use it rather than pretending localhost itself
is universally unavailable.

Latest request: Family B fields looked generic and NumberField, PasswordField,
RadioGroup lacked motion. Implemented shared matte FieldControl with an animated
focus halo; accepted numeric steps animate the SAME editable native input;
password uses IconButton + TextTransition for the eye glyph only; RadioGroup
uses AnimatedIndicator for a traveling selected row and a spring dot. Radio
items optionally accept descriptions. AnimatedIndicator now supports span as
well as its default div. All use existing motion presets/reduced-motion hooks.

Actual browser evidence for these three: both themes at 320/390/768/1440/1920
(30 checks, no horizontal overflow), screenshots in both themes, real in-flight
numeric translation/opacity and password icon crossfade/blur observed, radio
travel observed. Explicit reduced motion settled immediately; six live
Storybook axe scans returned zero violations and zero inconclusive results.
This is manual browser evidence, NOT a passing Playwright command.
e2e/field-motion.spec.ts adds automated regression coverage but has not run.
Keep AnimatedIndicator IMPLEMENTED too until its expanded render API completes
the browser gate. Native editing/IME and physical touch still need coverage.

First complete the full browser gate for the existing components, including
all changed Field consumers, Select after popup refactor, pointer/touch Slider
interaction and both theme/modifier matrices. Tests added: slider geometry
and native focus, select.spec.ts, combobox.spec.ts and theme-modifiers.spec.ts.
Run the full suite from a terminal that can access localhost normally.
Keep the browser evidence separate from automated command results.

Then continue Phase 2: MultiSelect, InputGroup and remaining Family A/B items
in COMPONENT_INVENTORY.md. Preserve the visual standard and inspect real
rendering before calling another component finished. Do not restart the plan
or duplicate existing components. Combobox is now implemented, not next work.

Important implementation details:
- Slider must not add CSS translation on top of Base UI's translate property.
- Slider motion render target uses tabIndex=-1 to avoid a second tab stop.
- Field must forward invalid to Base UI, not merely show Field.Error.
- Select/Combobox share internal OptionPopupSurface and Select's option CSS.
- Combobox uses createItems for stable IDs; it is not free-form search.
- Disabled options can be focusable but not selectable; read-only permits
  inspection. Do not weaken behavior tests based on incorrect assumptions.
- Storybook now exposes theme/density/radius/contrast/motion. Explicit reduced
  mode also zeros CSS durations. User runs pnpm storybook on port 6106.
## Things the next session needs to know that aren't obvious from the code

1. **TypeScript is pinned to 6.0.3, not latest (7.0.2).** Don't "helpfully"
   bump it — `typescript-eslint` doesn't support TS 7 yet (peer dep caps at
   `<6.1.0`). Check `npm view typescript-eslint peerDependencies` before
   ever changing this; revisit once that cap lifts.
2. **CSS and JS motion tokens are two separate files that must be changed
   together**: `packages/tokens/src/base.css` (durations/easings as CSS
   vars) and `packages/motion/src/tokens.ts` (durations/easings/springs as
   JS values for Motion-for-React). There is no build step that keeps them
   in sync automatically — this is a real gap. If you have spare capacity,
   consider generating one from the other, but don't let that block
   component work.
3. **Workspace packages must be built (`pnpm build`, not just
   `typecheck`) before a dependent package's `typecheck`/dev server can
   resolve their types** — `tsc --noEmit` alone doesn't produce `dist/`.
   If `apps/studio` or `packages/react` suddenly can't find `@b4/tokens` or
   `@b4/motion` types, this is almost certainly why. Storybook/Vite dev
   mode is the exception — it imports CSS and would import TS source
   directly if asked, so it doesn't need the dist build, but production
   builds and `tsc` do.
4. **Storybook story IDs don't slugify the way you'd guess** from the
   `title` string (punctuation like "—" and "&" collapses in non-obvious
   ways). If a Playwright test can't find a story by a guessed ID, build
   Storybook (`pnpm --filter @b4/studio run build-storybook`) and read
   `apps/studio/storybook-static/index.json` for the real ID.
5. **Never `import "./Component.css"` inside a component's `.tsx` file in
   `packages/react`.** This package has no CSS-import loader configured for
   its `tsc`/`tsup` build (unlike `apps/studio`, which has `vite/client`
   types and Vite's CSS handling) — it broke `tsc --noEmit` immediately
   when tried while building `TextTransition`. Every component's CSS is
   registered exactly once, via `@import` in `packages/react/src/
   styles.css` — follow that pattern for any new component, don't import
   CSS from the component file itself.
6. **jsdom has no `window.matchMedia`.** It's polyfilled in
   `packages/react/src/test/setup.ts`. Any new test-setup file (a new
   package with its own Vitest config) needs the same polyfill or any
   component calling `useReducedMotion()` will throw in tests.
7. **Color tokens that work as "white text on this fill" and "this color as
   text on the dark canvas" are not automatically the same safe value** on
   the Graphite (dark) theme, because the two reference backgrounds (white
   button-fill text vs. dark canvas) are different colors — the ratio that
   clears 4.5:1 against one can fail against the other. This is why
   `--b4-danger-text` and `--b4-accent-text` exist alongside `--b4-danger`/
   `--b4-accent` — building `Badge` and testing it in Porcelain (not just
   Graphite, which every earlier component had settled for) found a real
   2.68:1 failure on Graphite's accent text and two borderline Porcelain
   failures (danger, info) that hand-calculated sRGB math didn't reliably
   predict — only the real Playwright + axe-core run did. **Every new
   component that puts a status/accent color behind text (not a solid
   white-text fill) should be e2e-tested in both themes before being
   marked VERIFIED** — see `e2e/badge.spec.ts` for the pattern
   (`&globals=b4Theme:porcelain` in the iframe URL). Button/SegmentedControl/
   TextTransition/NumberTransition were only ever checked in Graphite —
   revisiting them with the same both-themes e2e pattern is good, cheap
   follow-up work.
8. **Git**: the user authorized pushing the current checkpoint on 2026-11-17.
   This supersedes the earlier wait-until-complete instruction. Never force-push.

9. **Playwright's worker count can flake against the shared Storybook dev
   server** ("Execution context was destroyed..." or an action silently
   not taking effect under load), purely from resource contention, not a
   real bug. `playwright.config.ts` currently caps `workers: 3` (lowered
   from 4 once the suite passed ~27 tests) — don't remove that cap
   without reason, and if tests flake anyway as the suite grows, lower it
   further rather than assume every flake is a false alarm.

## GitHub push is blocked by the harness, not by instruction (surface this to the user)

Earlier notes in this file say the user authorized pushing once the
checkpoint reaches a certain point, and later notes said to hold off
until the entire mission is done. Independent of which instruction is
current: `git push origin main` was attempted twice in this session
family and was **denied by the Claude Code auto-mode permission
classifier** ("[Unsanctioned Communication]"), not by a lack of user
authorization. Do not retry it via another tool or mechanism (raw HTTP
to the GitHub API, a different git remote URL, etc.) to work around the
denial — that would be bypassing a permission boundary, not completing
an authorized action. If/when the mission reaches a point where a push
is wanted, the user needs to either run it themselves or grant it in a
way the permission classifier accepts; a future session should just
retry the normal `git push` once asked, and if denied again, report it
rather than looking for a workaround.

## Historical archive

Content above this marker (except the operational header) is a chronological
implementation log from earlier checkpoints. Trust **only** the header and
`PROGRESS.md` / `QUALITY_MATRIX.md` for current mission state.
