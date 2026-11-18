# B4 — Progress

## CodeBlock — Family D's 11th component (2026-11-18)

**VERIFIED**, but only after fixing a real bug caught by a live browser
check (not just the automated gate): the original `await
navigator.clipboard.writeText(code)` had no `try`/`catch`, so a denied
clipboard permission threw an uncaught rejection and left the UI with
zero feedback. Fixed with a proper `try`/`catch` and a third `"failed"`
copy state (own icon, `aria-label`, and `aria-live` announcement).
Writing the failure-path test then exposed a SECOND bug — in the test
itself: `userEvent.setup()` installs its own `navigator.clipboard`
stub, silently overwriting a mock set up before it, so the earlier
success-path test had been passing against user-event's real stub all
along, not the intended mock. Fixed by mocking clipboard *after*
`userEvent.setup()` in both tests. Full gate: typecheck, @b4/react
tests 374/374, build, Storybook build, playwright 299/299 (run twice —
an earlier interrupted run showing only 19 passed was a false reading
from killing a manually-started dev server mid-run, discarded and
re-run clean). Family D now: 11/15.

Also fixed a stale phase-status table further down this file that
still said "Family A DONE, Family B mostly done" and listed Family C
as "STARTED (9/17)" — both had been complete for a while; the table
just hadn't been updated to match the dated log entries below it.

## Timeline, ActivityFeed — Family D's 9th and 10th components (2026-11-18)

`Timeline`: chronological connected list, per-item tone dot, real
`<ol>`/`<li>`. `ActivityFeed`: its actor-attributed sibling, reuses
`Avatar` directly. Kept as two components, not one with an optional
avatar, since Timeline's common case (system events) has no actor.
Full gate: typecheck, @b4/react tests 367/367, build, Storybook build,
playwright 294/294 (run twice). **Both VERIFIED**. Family D now: 10/15.

## Stat, EmptyState, ErrorState — Family D's 6th, 7th, 8th components (2026-11-18)

`Stat`: labeled metric + optional trend delta, reused `--b4-success`/
`--b4-danger-text` directly (both themes' own comments confirm they're
tuned for text-on-surface, not just icon-on-tint). `EmptyState`/
`ErrorState` share a shape but stay separate components: `ErrorState`
is `role="alert"`, `EmptyState` isn't — different semantics, not just
different color. Full gate: typecheck, @b4/react tests 359/359, build,
Storybook build, playwright 288/288 (run twice). **All three VERIFIED**.
Family D now: 8/15.

## Card, InteractiveCard — Family D's 4th and 5th components (2026-11-18)

`Card`: static content surface, `flat`/`raised`/`outlined`, reuses
`--b4-surface-radius`/`--b4-shadow-raised` (no new tokens needed).
`InteractiveCard`: its clickable sibling, a real `<button>` sharing
Button's press spring plus a hover lift, both skipped under
`useReducedMotion()`. No new gotchas. Full gate: typecheck,
@b4/react tests 343/343, build, Storybook build, playwright 279/279
(run twice). **Both VERIFIED**. Family D now: 5/15.

## Skeleton — Family D's 3rd component (2026-11-18)

`aria-hidden` loading placeholder, `text`/`circle`/`rect` variants,
gradient shimmer sweep. Unlike Progress/CircularProgress/Spinner
(genuine loading signal, so reduced motion only slows them), Skeleton
is purely decorative — reduced motion drops the animation entirely.
Found and fixed a jsdom quirk during testing: `toHaveStyle` resolves
`"2rem"` against jsdom's own 16px default root rather than the raw
inline value; fixed by asserting `el.style.height` directly. Full
gate: typecheck, @b4/react tests 334/334, build, Storybook build,
playwright 272/272 (run twice). **VERIFIED**. Family D now: 3/15.

## Progress, CircularProgress — Family D's first 2 components (2026-11-18)

Real Base UI `Progress` primitives — genuine `role="progressbar"`,
formatted value, real indeterminate state. `CircularProgress` reuses
the same Root/Label/Value parts for ARIA (confirming Progress is
visual-agnostic) but renders a real SVG `stroke-dashoffset` ring, not
a `conic-gradient` or rotating-border approximation — confirmed with a
real e2e comparison of `stroke-dashoffset` across two values. Both
honor reduced motion by slowing, not stopping, their indeterminate
animation. Full gate: typecheck 4/4, @b4/react tests 329/329, build,
Storybook build, playwright 268/268 (run twice). **VERIFIED**. Family
D now started: 2/15.

## LoadingOverlay — Family E's last component, Family E complete (2026-11-18)

A real blocking overlay — `pointer-events: auto` genuinely intercepts
clicks on covered content, proven with a real e2e test (a
`window.alert()` on the occluded button, listened for via Playwright's
`dialog` event: no alert while the overlay is up, the identical click
fires it once hidden). Reuses `Spinner` directly. Full gate: typecheck
4/4, @b4/react tests 316/316, build, Storybook build, playwright
254/254 (run twice). **VERIFIED**.

**Family E — Feedback & Motion is now complete: all 11 components
VERIFIED.**

## TransitionGroup — Family E (2026-11-18)

Real enter/exit list via Motion's `AnimatePresence` (`mode=
"popLayout"`), auto-wrapping a normal keyed list of children. Found a
real e2e test bug (not a component bug): a bare `page.locator("li")`
also matched Storybook's own always-present, invisible preview-iframe
error-boundary markup — confirmed via a throwaway debug script
dumping every matched element's HTML, fixed by scoping to the demo's
own item class. Full gate: typecheck 4/4, @b4/react tests 310/310,
build, Storybook build, playwright 250/250 (run twice). **VERIFIED**.

## ExpandingAction — Family E (2026-11-18)

Compact icon action that genuinely widens on hover/focus via real
`layout`-driven animation, confirmed with a real e2e `boundingBox()`
width comparison. Caught and corrected an assumption while writing
tests: jsdom's Motion animations don't resolve *synchronously*, but
they do eventually resolve via `waitFor` — tested that directly rather
than copying the "never progresses" caveat from elsewhere without
checking it applied here. Full gate: typecheck 4/4, @b4/react tests
306/306, build, Storybook build, playwright 246/246 (run twice).
**VERIFIED**.

## MorphingSurface — Family E (2026-11-18)

Real FLIP-based morph (Motion's `layout`/`layoutId` projection), the
general-purpose counterpart to `AnimatedIndicator` — that one is a
decorative indicator; this one is the content surface itself morphing,
including across two different mount points via a shared `layoutId`.
Confirmed with a real e2e `boundingBox()` width comparison, not just a
text-content check. No CSS file, purely behavioral like
`AnimatedIndicator`. Full gate: typecheck 4/4, @b4/react tests
299/299, build, Storybook build, playwright 241/241 (run twice).
**VERIFIED**.

## NotificationPanel — Family E (2026-11-18)

Persistent notification list in a popover, built on the existing
`Popover`. Unread state uses a dot + bolder text + visually-hidden
"(unread)" announcement, never color alone. Caught a real test bug
(passing a wrapper component instead of the actual trigger element to
`Popover`'s `trigger` prop silently breaks click handling) and the
same `--b4-text-disabled`-on-non-disabled-text mistake as Pagination/
Stepper/DatePicker — now a 4-time-repeated pattern, worth grepping
real token names every time. Full gate: typecheck 4/4, @b4/react tests
295/295, build, Storybook build, playwright 237/237 (run twice).
**VERIFIED**.

## InlineAlert — Family E (2026-11-18)

Persistent, page-level message, distinct from `Toast`/`Badge`. Four
tones, each with its own distinct icon (not color alone), reusing the
exact `--b4-{tone}`/`--b4-{tone}-bg`/`--b4-danger-text` token triad
`Badge.css` already established. Optional dismissible with a real
close button. Full gate: typecheck 4/4, @b4/react tests 289/289,
build, Storybook build, playwright 231/231 (run twice). **VERIFIED**.

## Toast — Family E (2026-11-18)

Real Base UI `Toast` system: `ToastProvider` + `useToast()` giving
`add`/`close`/`update`/`promise`, genuine stacked swipe-to-dismiss
toasts, real priority levels, a real `promise()`-driven loading →
success/error flow. Found and fixed a real, **pre-existing** bug that
had nothing to do with Toast itself: the e2e axe scan (which runs
right after clicking a primary Button, cursor still resting on it)
caught Graphite's `--b4-accent-hover` giving Button/IconButton's
`:hover` only 2.92:1 contrast against white text — a WCAG AA failure
live since Phase 0, never caught because no prior scan happened to
catch a Button mid-hover. Root cause: the hover color was aliasing
`--b4-accent-400`, a token also used (in the opposite contrast
direction) for accent text on dark surfaces — no single value
satisfies both. Fixed by giving hover its own token
(`--b4-accent-hover-fill`, 4.85:1) instead of sharing one meant for a
different job. Full gate: typecheck 4/4, @b4/react tests 283/283,
build, Storybook build, playwright 227/227 (run twice). **VERIFIED**.

## Spinner — Family E (2026-11-18)

Standalone counterpart to `Button`'s own inline `loading` spinner —
same visual design, extracted for use outside `Button`. `role="status"`
with an `aria-label`, reduced motion slows rather than stops the
animation (mirrors `Button`'s own existing choice). Full gate:
typecheck 4/4, @b4/react tests 277/277, build, Storybook build,
playwright 220/220 (run twice). **VERIFIED**.

## FileUpload — Family B's last component, Family B complete (2026-11-18)

A real dropzone: native `<input type="file">` over the whole visible
area for click-to-browse and keyboard operability, real `accept`/
`maxSizeBytes`/`maxFiles` validation, a real file list with removal.
Caught a real, load-bearing bug via the e2e drag-and-drop test: relying
on "the browser populates a file input's `.files` when something is
dropped on it" doesn't hold for a scripted drop event (browsers refuse
to set `.files` from untrusted events), so a Playwright test exercising
it failed — not a test-environment quirk to work around, but a sign the
implementation needed a real `onDrop` handler reading `event
.dataTransfer.files` directly, which is also the standard, more honest
mechanism every real drag-and-drop uploader uses. Full gate: typecheck
4/4, @b4/react tests 273/273, build, Storybook build, playwright
216/216 (run twice). **VERIFIED**.

**Family B — Inputs & Forms is now complete: all 19 components
VERIFIED.**

## ColorPicker — Family B, third of the last 4 (2026-11-18)

A real color picker: draggable + keyboard-operable saturation/
brightness area (`pointerdown`/`pointermove` + arrow-key nudging,
`role="slider"` with live `aria-valuetext`), a real Base UI `Slider`
reused for hue, hex text field synced both ways, real HSV↔RGB↔hex math.
Applied every lesson from DatePicker/TimePicker up front (standard
controlled/uncontrolled state, composing existing primitives directly,
watching for the ambient-label trap) — every unit test, build, and e2e
test (including real pointer drags on both the area and hue slider)
passed on the first run. Full gate: typecheck 4/4, @b4/react tests
265/265, build, Storybook build, playwright 209/209 (run twice).
**VERIFIED**.

## TimePicker — Family B, second of the last 4 (2026-11-18)

Two real Base UI `NumberField` instances (hours, minutes) composed
directly with the same internal recipe `NumberField.tsx` established,
plus `SegmentedControl` for AM/PM. Caught two real bugs before any
test ran: no internal `useState` fallback meant an uncontrolled
instance (defaultValue only) would never update from user interaction
(fixed by adding the standard controlled/uncontrolled pattern every
other stateful component here follows); and Base UI's ambient
`Field.Root` context gives every `NumberField.Input` the SAME
`aria-labelledby` regardless of its own `aria-label`, so both segments
had the identical computed name until explicitly cleared. Full gate:
typecheck 4/4, @b4/react tests 257/257, build, Storybook build,
playwright 202/202 (run twice). **VERIFIED**.

## DatePicker — Family B, first of the last 4 (2026-11-18)

Real ARIA APG "Date Picker Dialog" grid (`role="grid"`, roving
tabindex, full arrow-key/PageUp/PageDown/Home/End navigation, Enter to
select) wrapped in the existing `Popover` component. Found and fixed
three real bugs: a cross-month focus move needed a `useEffect` (not a
synchronous `.focus()` call or `requestAnimationFrame`) since the
target button doesn't exist until React re-renders the new month; a
real `color-contrast` violation on adjacent-month days (they're fully
clickable, not disabled, so the disabled-text token didn't apply);
and a missing accessible name on the popover dialog, fixed by passing
the field's own label as the popover's title. Scope, logged honestly:
weeks start on Sunday, no Shift+PageUp/PageDown year jump — real
simplifications, not dropped requirements. Full gate: typecheck 4/4,
@b4/react tests 249/249, build, Storybook build, playwright 195/195
(run twice). **VERIFIED**.

## TreeView — Family C's 17th component, Family C complete 17/17 (2026-11-18)

Real ARIA `tree`/`treeitem`/`group` with genuine nested `<ul
role="group">` subtrees, roving tabindex, and the full ARIA APG
keyboard pattern (arrows, Home/End) — built from scratch, no Base UI
primitive exists for trees. Found and fixed three real bugs via
real-Chromium traces: (1) keydown bubbling through every ancestor row
after a subtree expands, overriding the intended focus move — fixed
with an `event.currentTarget !== event.target` guard; (2) a disclosure
`<button tabIndex={-1} aria-hidden="true">`, an invalid WAI-ARIA
combination that also broke Playwright's role queries entirely —
changed to a non-focusable `<span>`; (3) giving that span a real
`aria-label` instead folded it into the row's accessible name (`"src"`
→ `"Collapse src"`), confirmed via a real accessibility snapshot — kept
it `aria-hidden` with no focusable duplicate of the row's own
keyboard-driven expand/collapse. Full gate: typecheck 4/4, @b4/react
tests 242/242, build, Storybook build, playwright 189/189 (run twice).
**VERIFIED.**

**Family C — Navigation & Overlays is complete: 17/17 VERIFIED.**

## CommandPalette — Family C's 16th component (2026-11-18)

Real Base UI `Dialog` wrapping a real Base UI `Combobox` in its
documented `inline` mode (list renders in the dialog body, not a
floating popup) — the exact composition Base UI's own docs describe
for this exact use case. Found and fixed a real bug via a real
Chromium run: the first draft called `preventUnmountOnClose()` on
close but never wired `actionsRef`/`unmount()` to finish it, leaving
the popup stuck mounted after every close. Fixed by completing the
pattern `Dialog.tsx`/`AlertDialog.tsx` already use correctly. Full
gate: typecheck 4/4, @b4/react tests 235/235, build, Storybook build,
playwright 183/183 (run twice). **VERIFIED**.

## Sheet — Family C's 15th component (2026-11-18)

`Drawer`'s bottom-anchored sibling: same Base UI `drawer` primitive
(`swipeDirection="down"`), reuses `Drawer`'s CSS, adds its own
positioning and a drag grabber. Applied all of Drawer's gotchas up
front (plain `open`/`onOpenChange`, no Motion-exit pattern) — first
run clean, no follow-up fixes. Full gate: typecheck 4/4, @b4/react
tests 229/229, build, Storybook build, playwright 178/178 (run twice).
**VERIFIED**.

## Drawer — Family C's 14th component (2026-11-18)

Built on Base UI's own `drawer` primitive: a right-edge side panel with
real swipe-to-dismiss (drag toward the right edge to close), CSS-driven
transitions (not Motion, to avoid colliding with the primitive's own
drag-driven `transform`). Tried the `actionsRef`/`preventUnmountOnClose`
pattern used by Dialog/AlertDialog first; it left the popup stuck
mounted after close in a real browser run because it raced Base UI's
own already-correct CSS-transition unmount timing — removed it in favor
of plain `open`/`onOpenChange`, the same simpler pattern Accordion/Tabs
use. E2e covers a real `page.mouse` drag-to-dismiss past the primitive's
dismiss threshold, not a simulated gesture. Full gate: typecheck 4/4,
@b4/react tests 224/224, build, Storybook build, playwright 173/173
(run twice). **VERIFIED**.

## NavigationMenu — Family C's 13th component (2026-11-18)

Built on Base UI's own `navigation-menu` primitive, matching the
composition from Base UI's docs example (`Root > List > Item >
Trigger + Content`, with a shared `Portal > Positioner > Popup >
Viewport`). Found and root-caused a real interaction bug via a
Chromium `MutationObserver` trace rather than guessing: clicking a
second trigger while a section is already open closed the whole menu
instead of switching, because the cursor passing over the trigger
already switches it via hover (Base UI's own documented behavior —
"opens when hovered or clicked"), and the trailing click then lands on
the now-already-open trigger, which `toggle: isActiveItem` closes.
Fixed the e2e test to assert the real interaction (hover switches,
a second click on the open trigger closes it) instead of the wrong one.
Full gate: typecheck 4/4, @b4/react tests 219/219, build, Storybook
build, playwright 168/168 (run twice). **VERIFIED**.

## Breadcrumbs, Pagination, Stepper — Family C's 10th-12th components (2026-11-18)

Added the three pure-presentational Family C navigation components
(no Base UI primitive exists for any of them): `Breadcrumbs`, a bounded
`Pagination` (first/last/current±1 + ellipsis, not every page number),
and a wizard-style `Stepper` (horizontal/vertical, complete/active/
upcoming via `aria-current="step"`). Registered in `index.ts`/
`styles.css`. Caught and fixed a real bug before shipping: both
`Pagination.css` and `Stepper.css` first referenced tokens that don't
exist (`--b4-accent-solid`, `--b4-surface-hover`, `--b4-surface-raised`)
— they compiled clean and looked fine at a glance, but axe caught a
real 1.04:1 white-on-white contrast violation on Porcelain. Fixed by
using the real tokens (`--b4-accent`, `--b4-control-bg-hover`,
`--b4-surface-2`) already used by `Button.css` for the same purpose.
Full CLI regression gate run and passed: `pnpm typecheck` (4/4),
`pnpm --filter @b4/react run test` (216/216), `pnpm --filter @b4/motion
run test` (5/5), `pnpm build`, Storybook build, `npx playwright test`
(162/162, run twice for stability). All three now **VERIFIED** — see
`QUALITY_MATRIX.md` and `COMPONENT_INVENTORY.md`.

## Full CLI regression gate closed (2026-11-17, later same day)

Every note below this point describes work done by a session whose
environment hit `EPERM` trying to start the CLI Playwright webServer, so
it could only verify via manual browser control and left all touched
components at IMPLEMENTED. A later session the same day had a working
CLI Playwright setup and ran the exact missing gate:
`pnpm install` → `pnpm typecheck` (5/5) → `pnpm --filter @b4/react run
test` (129/129) → `pnpm --filter @b4/motion run test` (5/5) → `pnpm build`
→ `pnpm --filter @b4/studio run build-storybook` → `npx playwright test`
(87/87, run twice for stability). One real finding: Base UI's own
internal focus-guard sentinel elements tripped axe's `aria-hidden-focus`
rule in `select.spec.ts`/`combobox.spec.ts` — the same thing the
Combobox checkpoint below already flagged as "2 inconclusive" by hand;
disabled that one rule with the reasoning recorded in both spec files.
Also added missing both-theme e2e axe coverage for `IconButton`/
`ToggleButton` (`e2e/icon-toggle-button.spec.ts`), the only two touched
components that had none. **Every component below marked IMPLEMENTED
pending this gate is now VERIFIED** — see `QUALITY_MATRIX.md`'s matching
top section and `COMPONENT_INVENTORY.md`. The notes below stay as the
real history of how the code got here; they're not re-written to hide
that the gate was briefly blocked.

Latest Switch refinement (2026-11-17): replaced physical CSS thumb translation
with shared travel-spring layout motion, neutral control tokens, snap press
feedback, forwarded ref and minimum hit target. Added AllStates/RTL stories.
Focused Switch tests 7/7, ESLint, typecheck, package/Storybook builds passed.
Browser access recovered with a fresh tab and running Storybook: both themes
visually inspected, exact thumb insets measured, real travel frames, keyboard,
rapid changes and RTL reduced motion checked. Full browser gate remains pending.

Latest Checkbox refinement (2026-11-17): neutral selected surface, snap press
feedback, animated drawing/morph between mixed and checked, zero-duration
reduced motion, forwarded control ref and shared minimum hit target. Added
AllStates and Select all interaction stories. Checkbox tests 9/9, ESLint,
workspace typecheck, package/Storybook builds passed. Browser motion/theme
verification for this revision remains pending; no new full-suite total claimed.

Latest Field story correction (2026-11-17): replaced the native-select examples
with existing B4 Select in WithCustomControl and WithError. Preserved story IDs,
removed inline visual styling and documented Select's existing Field ownership.
Focused ESLint, workspace typecheck and React 124/124 passed; visual recheck of
these story revisions is pending because the local preview refused connection.

Read this + `HANDOFF.md` + `git log`/`git status` before doing anything else
on resume. Don't re-plan from scratch — continue from what's actually here.

## Phase status

| Phase | Status | Notes |
|---|---|---|
| 0 — Init, tokens/themes, motion foundations, Studio shell, docs infra | **DONE** | See below. |
| 1 — Motion foundation components (TextTransition, NumberTransition, AnimatedIndicator, SegmentedControl reference component) | **DONE** | All four built (earlier verification below; corrective recheck pending for SegmentedControl), plus a `useAsyncStatus` race-safe async-state hook in `@b4/motion`. SegmentedControl refactored onto the shared `AnimatedIndicator` primitive (no more duplicated layoutId logic). |
| 2 — Family A + B to full quality gate | **DONE** | Family A: all 12 components VERIFIED. Family B: all 19/19 VERIFIED (including DatePicker, TimePicker, ColorPicker, FileUpload). See QUALITY_MATRIX.md and COMPONENT_INVENTORY.md — this row was stale (said "Family B mostly done") until 2026-11-18; Family B finished the same day as the FileUpload checkpoint below. |
| 3 — Family C | **DONE** | All 17/17 VERIFIED. See QUALITY_MATRIX.md. |
| 4 — Family D | **STARTED (10/15)** | Progress, CircularProgress, Skeleton, Card, InteractiveCard, Stat, EmptyState, ErrorState, Timeline, ActivityFeed VERIFIED. CodeBlock in progress; DataTable, DataGrid, Calendar, ChartContainer remain PLANNED. See QUALITY_MATRIX.md. |
| 5 — Family E/F advanced + specialized components | **Family E DONE (11/11), Family F NOT STARTED** | |
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

## Field extracted (as promised in the last HANDOFF note) — and merged with FormField

`TextField`/`Textarea`/`PasswordField`/`SearchField` refactored onto a
new shared `Field` component instead of each inlining Base UI's
`Field.Root`/`Label`/`Description`/`Error`. All 27 e2e tests and all
unit tests still pass unchanged after the refactor, confirming it's
behavior-preserving. Also folded the brief's separate "FormField"
inventory entry into `Field` — they turned out to be the same component
(see `COMPONENT_INVENTORY.md`'s scope-changes log).

Building `Field`'s own test honestly found that its first doc comment
overclaimed: a bare custom `<select>` does **not** get automatic label
association, only a Base-UI-aware control does. Fixed the docs/example,
not the component — see `QUALITY_MATRIX.md`.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(69/69), `pnpm build`, Storybook build, `npx playwright test` (27/27,
unchanged from before the refactor).

## NumberField — real Base UI NumberField, and a worker-count re-tune

Built on Base UI's full `NumberField` (`Root`/`Group`/`Input`/
`Increment`/`Decrement`), not `TextField` with `type="number"` — gives
real min/max clamping and keyboard/button stepping. Uses the shared
`Field` wrapper. Found that the *visible* input renders `role="textbox"`,
not `"spinbutton"` (Base UI keeps a separate hidden `type="number"` input
for native form semantics that carries that role) — corrected the unit
tests to query the right element rather than assume the ARIA role from
the component's name.

The Playwright worker-count flakiness (see Phase 2's Checkbox/Switch/
RadioGroup entry) came back as the suite grew past ~27 tests at
`workers: 4`; lowered to `workers: 3` and confirmed stable across two
full repeat runs.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(74/74), `pnpm build`, Storybook build, `npx playwright test` (30/30,
twice in a row at the new worker count).

## Slider checkpoint (2026-11-17)

Slider supports single and array values through the same Base UI primitive.
Added ref forwarding, shared focus-offset token, and explicit reduced-motion
suppression of thumb transitions. React unit tests: 80/80; motion: 5/5;
typecheck, package build and Storybook build passed in this session.
Browser checks could not start in that session: Storybook profile settings
access failed (EPERM), and the static-server fallback was blocked by
localhost socket permissions. **Update, later the same day**: a different
session's CLI Playwright worked; `e2e/slider.spec.ts` passes 20/20 (both
themes, 5 widths, keyboard, native-focus). Slider is **VERIFIED**.

## Family A completed; DropdownMenu opens Family C

Built the rest of Family A: `Link`, `StatusBadge`, `Avatar`, `AvatarGroup`,
`KeyboardShortcut`, `ButtonGroup`, and `SplitButton`. `SplitButton` pulled
`DropdownMenu` forward from Family C rather than ship a decorative,
non-functional chevron — a split button's defining feature *is* its
attached menu. `DropdownMenu` is a real Base UI `Menu` composition
(keyboard nav, positioning, focus-guard sentinels), reused as-is by both
the standalone Family C component and `SplitButton`.

Found and fixed a real bug while building SplitButton's own test:
clicking a menu item silently did nothing because the first draft of
SplitButton's story forgot to pass the required `onSelect` prop, so the
click handler threw and aborted before Base UI's own close-on-click
logic ran. Root-caused with `page.on("pageerror", ...)` in a throwaway
debug test rather than guessing at the component. Added a permanent
regression test for the mouse-click-selects-and-closes path, which no
earlier test actually covered (only keyboard Enter and Escape were
tested before). See QUALITY_MATRIX.md for the full writeup, including
two more test-timing fixes found along the way (axe sampled mid-fade;
a rapid-cycle stress test raced the settle spring under full motion).

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(156/156), `pnpm build`, Storybook build, `npx playwright test` (109/109,
run twice for stability).

## Family B's remaining core inputs: MultiSelect, InputGroup

`MultiSelect` shares `Select`'s Base UI `Root` with `multiple` turned on
(same "share one implementation" pattern as Slider/RangeSlider) — its
trigger shows a comma-joined summary up to two picks, then a count.
`InputGroup` joins a (possibly interactive) addon with an input inside
one visual control box, distinct from `TextField`'s decorative-only
icon slots. Both reuse existing CSS (`Select.css`/`TextField.css`), no
new stylesheet needed.

Family B now stands at 15/19 VERIFIED; only DatePicker, TimePicker,
ColorPicker, and FileUpload remain PLANNED.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(164/164), `pnpm build`, Storybook build, `npx playwright test`
(115/115, run twice).

## Tooltip — Family C's second component

Real Base UI `Tooltip` (hover/focus delay, positioning, portal),
`children` becomes the trigger via `render`. Found two test-infra
issues, not component defects: a disabled-button story can't exercise
the focus-triggered path (native disabled buttons are unfocusable), and
Storybook's own `addon-a11y` background scan can collide with a
manually-triggered one fired too soon — both documented in
`TESTING.md`/`QUALITY_MATRIX.md` for the next popup-bearing component.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(168/168), `pnpm build`, Storybook build, `npx playwright test`
(120/120, run twice).

## Popover — Family C's third component

Real Base UI `Popover`, click-triggered, holds genuinely interactive
content (not a static mockup — see the `WithInteractiveContent` story).
Closes on Escape/outside-click, returns focus to the trigger. Only
jsdom's known "no real animation frame" limitation needed a test
adjustment (same category already seen on TextTransition/DropdownMenu).

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(173/173), `pnpm build`, Storybook build, `npx playwright test`
(125/125, run twice).

## Tabs — Family C's fourth component; another real contrast bug

Built on Base UI's `Tabs`, styled with its own `Tabs.Indicator` CSS
variables via a plain CSS transition (Base UI owns the position calc).
The axe scan caught a real bug: the selected-tab CSS used `[data-
selected]`, but Base UI's real attribute is `data-active` — the
selector never matched, leaving the selected tab's text at the
unselected color against the indicator's selected-surface background
(1.42:1 on Porcelain). Fixed, and noted in `HANDOFF.md`: check each new
Base UI primitive's own `*DataAttributes.d.ts` rather than assuming the
"is-active" attribute name from another component's convention.

Also fixed `select.spec.ts` e2e flakiness that returned once the suite
passed ~125 tests — this time from Storybook's background axe scan
colliding with a manual one, and a keyboard test firing too fast after
a popup opened. Fixed both with the proven "settle wait" pattern;
confirmed lowering `workers` further did *not* fix it (root cause
wasn't concurrency), so kept `workers: 3`.

## User-requested: TextTransition/NumberTransition motion improvements

The user explicitly asked for these two (already-VERIFIED) components'
animations to be improved. `crossfade` now adds a subtle scale to the
existing opacity/blur fade; `vertical`/`horizontal` modes switched from
a plain tween to `springs.snap` (matching `MOTION_SPEC.md`'s "spatial
move → spring" rule); `NumberTransition` now forces tabular-nums so
digit-width changes don't jitter the layout mid-slide. No API changes.

Verified (covers both Tabs and the motion pass): `pnpm typecheck` (5/5),
`pnpm --filter @b4/react run test` (178/178), `pnpm build`, Storybook
build, `npx playwright test` (130/130, run multiple times).

## Accordion — Family C's fifth component

Built on Base UI's `Accordion`, panel height animated from Base UI's own
`--accordion-panel-height` CSS variable. Confirmed the Trigger's own
`[data-panel-open]` attribute per-part (Item/Panel use `data-open`
instead) rather than assuming one shared attribute name.

Two findings, both test-side: the keyboard test assumed arrow-key roving
focus between triggers, which Base UI deliberately removed (follows an
updated ARIA APG guidance that accordion headers are plain Tab stops,
not a composite widget) — rewrote it to verify the current, correct
contract. Also hit a stray `*/` inside a doc comment's prose that closed
the comment early and cascaded into unrelated-looking syntax errors.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(183/183), `pnpm build`, Storybook build, `npx playwright test`
(135/135, run twice).

## Dialog — Family C's sixth component; prevented a Slider-class bug before it shipped

Real Base UI `Dialog`, modal by default. Recognized before building
that centering the popup with `transform: translate(-50%, -50%)` would
collide with Motion's own `scale` transform (the same "double transform"
class of bug `Slider`'s geometry had) and used fixed-inset +
`margin: auto` centering instead, which needs no transform at all.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(188/188), `pnpm build`, Storybook build, `npx playwright test`
(140/140, run twice).

## AlertDialog — Family C's seventh component

Reuses `Dialog`'s CSS but is its own Base UI primitive, with no
decorative close button and — verified in a real browser — no
outside-click dismissal, forcing an explicit Cancel/Confirm choice.
Clean on the first pass: the `Dialog` transform-collision lesson and
the per-part data-attribute lesson from `Tabs`/`Accordion` both paid off
here with nothing to find.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(193/193), `pnpm build`, Storybook build, `npx playwright test`
(145/145, run twice).

## ContextMenu, HoverCard — Family C's eighth and ninth components

`ContextMenu` reuses `DropdownMenu`'s item type and CSS (one visual
menu, two ways to open it); caught by `tsc` that `ContextMenu.Root` has
no `actionsRef`/`preventUnmountOnClose`, unlike every other popup-based
component so far, and adjusted rather than guessing. `HoverCard` is
Base UI's "PreviewCard" under the mission brief's conventional name.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(200/200), `pnpm build`, Storybook build, `npx playwright test`
(152/152, run twice).

## Git

The user's latest request authorizes pushing this checkpoint now, superseding
the earlier instruction to wait for all phases. The project remains in Phase 2.
Push outcome must be checked against the remote; do not force-push.

## Select implementation checkpoint (2026-11-17)

- Added Select using existing Field and Base UI Select. Three sizes, option
  descriptions, controlled/uncontrolled values, null reset, form integration,
  disabled/read-only/error/empty states, keyboard interaction and trigger ref.
- Added shared popup height/z-index tokens (documented at their definitions).
  Popup reads spacing tokens for its offset and uses the shared settle spring
  with reduced-motion handling and exit retention.
- 14 Select tests pass; full React suite 94/94, motion 5/5, typecheck,
  package build and Storybook build passed. Focused ESLint and standalone
  e2e TypeScript checks passed. Story IDs checked against generated index.json.
- Added 10 stories and 14 Playwright cases. Browser and visual verification
  were blocked in that environment; this has since been resolved — see the
  top-of-file note. Select is **VERIFIED** (`e2e/select.spec.ts`, 10/10,
  both themes).
- Current continuation: finish Slider/Select browser gates, then Combobox.
  Studio remains a Phase-6 placeholder; pnpm storybook is the working catalog
  command when run from a terminal that can open localhost listeners.

## Visual correction + Combobox (latest checkpoint)

Twenty public components now exist. Three unchanged components retain their
previous VERIFIED status; seventeen touched components are IMPLEMENTED pending
the full browser recheck. This does not mean the full plan is complete.

Corrected Slider geometry, states, focus, naming, form semantics and stories;
implemented Combobox with shared popup styling and motion; fixed cross-cutting
Field invalid state, disabled auxiliary actions, clear focus, token literals,
control-radius and explicit CSS reduced motion. Added all modifier toolbars.
Actual browser evidence and its limits are in QUALITY_MATRIX.md and
AUDIT_REPORT.md. CLI Playwright remains blocked; browser control works against
the user's running server. Do not confuse those two verification channels.

Continue the correction gate across the twenty existing components before
expanding further into Phase 2. MultiSelect and the rest of the inventory
remain planned. No phase, release or complete audit is claimed finished here.

**Update, later the same day**: the correction gate is done — see the
top-of-file note. All twenty components are VERIFIED, including Combobox
(`e2e/combobox.spec.ts`, 15/15, both themes). The "2 inconclusive" axe
results mentioned above were both the same Base UI focus-guard sentinel
false positive Select also hit; see QUALITY_MATRIX.md for the specific
rule and reasoning.

## Family B interaction refinement (latest, 2026-11-17)

Implemented animated focus feedback on the shared matte text-entry surface,
directional stepping on NumberField's existing native input, PasswordField's
visibility-glyph transition and RadioGroup's traveling selected row/spring dot.
Reused IconButton, TextTransition and AnimatedIndicator; the latter now accepts
an optional span target. Added radio descriptions and regression tests for
native-input identity, rapid toggles, controlled rejection and whole-row clicks.

Passed: React 124/124, motion 5/5, workspace typecheck, package build,
Storybook build, focused ESLint and standalone field-motion e2e typecheck.
Real browser: three controls in both themes at five widths (30 no-overflow
checks), in-flight motion observed, reduced motion checked, six live axe scans
with zero violations/inconclusive. New e2e/field-motion.spec.ts is written but
not executed: the CLI browser gate remains blocked as recorded above.
Next: finish the regression gate for changed shared Field consumers and the
existing inventory before adding MultiSelect. HANDOFF.md has exact details.

**Update, later the same day**: `e2e/field-motion.spec.ts` has been run —
7/7 pass (NumberField/PasswordField/RadioGroup in both themes + the
explicit reduced-motion check), part of the 87/87 full-suite run. The
regression gate this section asked for is done; see the top-of-file note.
Next real work: Family A's remaining components (ButtonGroup, SplitButton,
Link, StatusBadge, Avatar, AvatarGroup, KeyboardShortcut) and Family B's
InputGroup/MultiSelect/DatePicker/TimePicker/ColorPicker/FileUpload, then
Family C.
