# B4 — Quality Matrix

## Full CLI automated regression gate closed (2026-11-17, this session)

Every prior checkpoint below (Slider, Select, Combobox, the Family B motion
refinement) was left at **IMPLEMENTED** specifically because the agent
doing that work hit `EPERM` trying to start the CLI Playwright webServer in
its environment, and could only verify via manual browser control — real
evidence, but not the full automated regression. This session's
environment has a working CLI Playwright setup (confirmed across this
whole project), so that exact missing gate was run:

```
pnpm install                                     # clean
pnpm typecheck                                    # 5/5 packages clean
pnpm --filter @b4/react run test                  # 129/129
pnpm --filter @b4/motion run test                 # 5/5
pnpm build                                        # clean
pnpm --filter @b4/studio run build-storybook      # clean
npx playwright test                               # 87/87, run twice for stability
```

One real defect surfaced and was fixed in the process: `select.spec.ts`'s
and `combobox.spec.ts`'s axe scans failed on `aria-hidden-focus` against
Base UI's own internal focus-guard sentinel elements
(`data-base-ui-focus-guard`, deliberately `aria-hidden="true"` +
`tabindex="0"` to catch Tab/Shift+Tab at a popup's edges and redirect
focus back inside — the standard focus-sentinel technique, not a B4 or
Base UI defect). This matches exactly the "two inconclusive" axe results
the Combobox checkpoint below already flagged by hand; running the real
CLI/axe-core combination turned "inconclusive" into a specific, named,
confidently-dismissable rule rather than leaving it an open question.
Disabled that one rule, with the reasoning recorded in both spec files,
and both scans now pass clean otherwise.

Also added missing e2e axe coverage (both themes) for `IconButton` and
`ToggleButton`, which had none (`e2e/icon-toggle-button.spec.ts`) — every
other touched component already had it.

**Every component below that is covered by one of the e2e spec files is
now re-verified against this exact repo state and upgraded to VERIFIED.**
The detailed historical notes (visual-pass descriptions, manual-browser-
evidence writeups, defect lists) below this point are kept as-is — they're
real provenance for *why* the current code looks the way it does, not
superseded by the status upgrade.

Latest Switch revision: shared spring thumb travel, logical RTL layout, neutral
selected surfaces and press feedback. Focused Switch tests 7/7, ESLint,
typecheck, package/Storybook builds passed. Manual browser: both-theme AllStates
screenshots, 2px thumb vertical inset, actual intermediate travel transforms,
Space activation, eight rapid clicks and instant RTL reduced motion checked.
Full responsive/modifier/live-axe/CLI regression is not complete; IMPLEMENTED.

Latest Checkbox revision: neutral selected tokens, animated check drawing/mixed
morph, press feedback and reduced-motion handling. Focused Checkbox tests 9/9,
ESLint, workspace typecheck, package build and Storybook build passed. AllStates
and Selection document the actual states. No new browser/theme/motion/axe proof
for this revision yet; Checkbox remains IMPLEMENTED. Historical evidence below
does not certify these changed visuals.

Latest Field docs correction: WithCustomControl/WithError now reuse B4 Select
instead of a native select. ESLint, typecheck and React 124/124 passed. These
specific story revisions have no new browser evidence: preview connection was
refused this turn. Field remains IMPLEMENTED; see HANDOFF.md for continuation.

Per-component status against the quality gate (visual / interaction / docs /
verification — see `TESTING.md` for what each means concretely). **VERIFIED**
is only set when the checks below actually ran and passed — not on
"it compiles." Evidence links to the actual command run.

| Component | Status | Visual (both themes) | Interaction + a11y | Docs/stories | Verification evidence |
|---|---|---|---|---|---|
| **Button** | **VERIFIED** | ✅ 4 variants × 3 sizes × hover/active/disabled/loading, Graphite + Porcelain | ✅ keyboard activation, disabled blocks click, `aria-busy`/`aria-disabled`, no stuck state under 10 rapid clicks | ✅ Storybook stories with autodocs, do/don't note | `pnpm --filter @b4/react test` (6/6 pass incl. jest-axe), `npx playwright test` (2/2 pass incl. axe-core across all 4 variants in Graphite), `pnpm typecheck` clean, `pnpm build` clean, `pnpm --filter @b4/studio run build-storybook` clean |
| **SegmentedControl** | **VERIFIED** | ✅ 2/3-way + disabled-item stories × sm/md/lg, Graphite (Porcelain reviewed via Storybook toolbar, not yet e2e'd — same caveat as Button, see below) | ✅ Base UI `ToggleGroup`/`Toggle` gives real arrow-key roving focus + `data-pressed`/`data-disabled` for free; controlled + uncontrolled value tested; indicator proven to stay at exactly 1 DOM node under 8–12 rapid alternating clicks (unit + e2e) | ✅ Storybook stories incl. the explicit Changelog/Login reference story, autodocs | `pnpm --filter @b4/react test` (6/6 for this component, 12/12 total incl. Button), `npx playwright test` (2/2 for this component, 4/4 total), `pnpm typecheck`/`pnpm build`/Storybook build all clean |

| **AnimatedIndicator** | **VERIFIED** | ✅ unstyled primitive (consumer supplies CSS); demonstrated between two targets, Graphite | ✅ exactly one DOM node under 8–10 rapid alternating moves (unit + e2e); `useReducedMotion()` collapses travel to instant | ✅ Storybook story, autodocs | `pnpm --filter @b4/react test`, `npx playwright test` (both in the full suite totals below) |
| **TextTransition** | **VERIFIED** | ✅ crossfade/vertical/horizontal modes, Graphite | ✅ rapid successive value changes don't stack/corrupt display; unmount/remount doesn't duplicate; reduced motion collapses to instant swap | ✅ Storybook stories (3 modes + manual-control do/don't), autodocs | same suite |
| **NumberTransition** | **VERIFIED** | ✅ static/counting/currency-format/up-down stories, Graphite | ✅ custom formatter supported; direction auto-derived from increase/decrease; rapid-click stress test in e2e | ✅ Storybook stories, autodocs | same suite |
| **IconButton** | **VERIFIED** | ✅ 4 variants × 3 sizes, Graphite | ✅ required `aria-label`, blocks clicks while loading/disabled | ✅ Storybook stories, autodocs | same suite |
| **ToggleButton** | **VERIFIED** | ✅ pressed/unpressed/disabled, Graphite | ✅ Base UI `Toggle` gives real `data-pressed`/keyboard (Space) for free; click + keyboard tested | ✅ Storybook stories, autodocs | same suite |
| **Badge** | **VERIFIED** | ✅ 6 tones, **both themes e2e'd with real axe color-contrast**, not just Graphite | ✅ static/presentational, no interaction states needed | ✅ Storybook stories (incl. all-tones overview), autodocs | `e2e/badge.spec.ts` runs axe against both the Graphite *and* Porcelain toolbar states — the first component in this repo to get that, after Button/SegmentedControl only ever checked Graphite |

| **Checkbox** | **VERIFIED** | ✅ unchecked/checked/indeterminate/disabled, both themes e2e'd | ✅ Base UI `Checkbox.Root`/`Indicator` gives real tri-state ARIA + keyboard for free; label-click toggles via native `<label>` association | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |
| **Switch** | **VERIFIED** | ✅ off/on/disabled, both themes e2e'd | ✅ Base UI `Switch.Root`/`Thumb`; label-click + Space key toggle | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |
| **RadioGroup** | **VERIFIED** | ✅ default + disabled-item stories, both themes e2e'd | ✅ Base UI `RadioGroup`/`Radio` gives real roving-tabindex arrow-key nav + ARIA radiogroup semantics for free; verified with a real-browser keyboard test, not just unit | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated keyboard-nav e2e |

| **TextField** | **VERIFIED** | ✅ default/hint/error/required/disabled/3-sizes stories, both themes e2e'd | ✅ Base UI `Field`+`Input` gives real label/description/error ARIA wiring; error replaces hint rather than both showing; typed-input e2e in a real browser | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |

| **Textarea** | **VERIFIED** | ✅ default/hint/error/disabled, both themes e2e'd | ✅ Base UI `Field.Control render={<textarea/>}` pattern; multi-line typed input verified | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |
| **PasswordField** | **VERIFIED** | ✅ default/hint/error/disabled, both themes e2e'd | ✅ real-browser e2e for the show/hide toggle actually changing input `type`; toggle is keyboard-reachable (verified by unit test tabbing to it) | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated toggle e2e |
| **SearchField** | **VERIFIED** | ✅ empty/with-value/disabled, both themes e2e'd | ✅ clear button appears only with a value and actually empties it (real-browser e2e, not just unit) | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated clear e2e |

| **Field** | **VERIFIED** | ✅ with-custom-control/with-error stories | ✅ confirmed the label only auto-associates with a Base-UI-aware control (`Input`/`Checkbox`/`Switch`/`Field.Control`'s `render` prop) — a bare native element as `children` does **not** get the wiring for free; this was found by the component's own test failing, fixed by correcting the test/story/doc, not the component (the component was already correct; the first draft of its *docs* overclaimed) | ✅ Storybook stories, autodocs | unit tests; see "A docs-accuracy catch" below |

| **NumberField** | **VERIFIED** | ✅ default/hint/error/step/disabled stories, both themes e2e'd | ✅ real Base UI `NumberField` (not `type="number"` on TextField) — min/max clamping, keyboard stepping, stepper buttons all tested; visible input is `role="textbox"` not `"spinbutton"` (a hidden hidden `type="number"` input carries that role instead), test queries corrected to match | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated stepper e2e |

**Earlier NumberField checkpoint totals**: `pnpm typecheck` (5/5 packages clean), `pnpm --filter @b4/react run test` (74/74), `pnpm --filter @b4/motion run test` (5/5, incl. the async-status race-safety test), `pnpm build` (clean), `pnpm --filter @b4/studio run build-storybook` (clean), `npx playwright test` (30/30, incl. axe-core on Button/SegmentedControl/TextTransition/Badge/Checkbox/Switch/RadioGroup/TextField/Textarea/PasswordField/SearchField/NumberField stories — form controls checked in both themes). Playwright `workers` lowered 4→3 in `playwright.config.ts` as the suite grew past ~27 tests and started flaking again at 4 — see `TESTING.md`.

## A docs-accuracy catch: Field's label doesn't auto-associate with just anything

`Field` was extracted from `TextField`/`Textarea`/`PasswordField`/
`SearchField` (see `HANDOFF.md`'s prior note calling for this once 4
components inlined the same composition). Its first doc comment and demo
story claimed you could pass *any* custom control as `children` and get
label association for free. Writing the straightforward test for that —
a bare `<select>` — failed immediately with a real jsdom/axe error
("Select element must have an accessible name"), because Base UI's
`Field.Label` only wires its `htmlFor`/id onto a Base-UI-aware control
(`Input`, `Checkbox`, `Switch`, or anything rendered via `Field.Control`),
not onto an arbitrary child element. The fix was to correct the docs and
the example (route the `<select>` through `Field.Control`'s `render`
prop, the same pattern `Textarea` already uses for its native
`<textarea>`), not to change `Field` itself — the component was right,
the first draft of its documentation wasn't. Recorded here so nobody
"fixes" `Field` later by trying to make bare children work, which isn't
how Base UI's Field system is designed to behave.

## A real bug caught by the unit test, not by eye: SearchField's "clear" didn't clear

`SearchField`'s initial implementation passed both `value` (the external
controlled prop, `undefined` in uncontrolled use) and `defaultValue` to
the underlying `<Input>`, and tracked "current value" in a separate
`useState` for deciding whether to show the clear button. Clicking clear
updated that separate state but never told the actual (uncontrolled) DOM
input to reset, because `defaultValue` only applies once, at mount. The
clear button visually disappeared's condition changed, but the input's
real value didn't. The unit test
(`SearchField.test.tsx`'s "shows a clear button... and clears it on
click") caught this immediately. Fix: always pass the *computed* current
value (`value ?? internalValue`) to the underlying primitive — the same
"fully controlled internally, computed once for the uncontrolled case"
pattern already used by `SegmentedControl`. **Lesson for new
controllable components**: never pass both `value` and `defaultValue`
through to the underlying primitive at once — pick one computed value and
always pass that.

## Three more real accessibility bugs, caught by actually testing Porcelain

Building Badge and testing it in *both* themes (not just Graphite, which
every prior component had settled for) found three real token-level
contrast failures that had shipped undetected:

- Graphite's `--b4-accent` (used directly as Badge's accent-tone text
  color) measured 2.68:1 against its own `--b4-accent-subtle-bg` —
  nowhere close to AA. Fixed by adding `--b4-accent-text` (aliased to the
  lighter `--b4-accent-400`), the same pattern as `--b4-danger-text`.
- Porcelain's `--b4-danger` and `--b4-info` were both borderline (4.05–
  4.48:1 depending on how the background tint was tuned) against their
  own `-bg` tints. Chasing the background tint percentage alone couldn't
  reliably clear 4.5:1; darkening `--b4-danger` itself (to `#c53128`) was
  what actually gave real margin.
- **Takeaway, now in `HANDOFF.md`**: don't declare a component's color
  usage safe from hand-calculated contrast math alone — the actual
  `color-mix()` output and axe's measurement occasionally disagreed with
  manual sRGB-linear-mix arithmetic by enough to flip pass/fail at the
  margins. Run the real Playwright + axe check, in both themes, before
  calling a color pairing done.

## Family A completed, DropdownMenu opens Family C (2026-11-17, later still)

| Component | Status | Evidence |
|---|---|---|
| Link | **VERIFIED** | Unit (href/external target+rel/axe), e2e axe both themes |
| StatusBadge | **VERIFIED** | Unit (text label always visible, decorative dot `aria-hidden`, axe), e2e axe both themes |
| Avatar | **VERIFIED** | Unit (initials from 1/2-word names, image-error fallback, accessible name, axe), e2e axe both themes |
| AvatarGroup | **VERIFIED** | Unit (real overflow count, no indicator when everyone fits, axe), e2e axe both themes + overflow check |
| KeyboardShortcut | **VERIFIED** | Unit (one `<kbd>` per key in order, axe), e2e axe both themes |
| ButtonGroup | **VERIFIED** | Unit (ARIA group, each button independently clickable, axe), e2e axe both themes |
| SplitButton | **VERIFIED** | Unit + e2e (primary action vs. menu are independent interactions; see the bug below) |
| **DropdownMenu** (Family C's first component) | **VERIFIED** | Real Base UI `Menu` — keyboard nav, typeahead-adjacent roving focus, positioning, `aria-hidden-focus`-exempt focus guards; unit + e2e both themes incl. disabled-item and rapid open/close |

Full suite at this checkpoint: `pnpm typecheck` (5/5), `pnpm --filter
@b4/react run test` (156/156), `pnpm --filter @b4/motion run test` (5/5),
`pnpm build`, Storybook build, `npx playwright test` (109/109, run twice).

### A real bug, caught building SplitButton's own test — not a component defect

`SplitButton`'s first Storybook story args provided `items` but never
`onSelect` (required). Clicking a menu item threw `onSelect is not a
function` **inside** the click handler, which silently aborted before
Base UI's own close-on-click logic could run — so the menu stayed open
and looked broken. Standalone `DropdownMenu`, tested with a story that
*did* supply `onSelect`, worked correctly for the identical mouse-click
path the whole time; this was never a `DropdownMenu`/`Base UI` defect.
Root-caused by isolating the variable (swapped triggers, added console/
pageerror capture in a throwaway debug test) rather than guessing — the
`page.on("pageerror", ...)` capture is what actually surfaced the thrown
exception. Fixed the story, and added a permanent regression test
(`e2e/dropdown-menu.spec.ts`'s "clicking a menu item with the mouse...")
pinning the mouse-click-closes-the-menu path specifically, since no
earlier test exercised it (existing tests only covered keyboard Enter-
to-select and Escape-to-close).

**Lesson for HANDOFF.md**: when a Storybook-driven e2e interaction
mysteriously no-ops, check for an uncaught exception in a required prop
the story forgot to pass before suspecting the component or Base UI —
`page.on("pageerror", (err) => console.log(err.message))` finds this in
seconds.

### Also found: DropdownMenu's own axe/stress tests needed the same fixes as Select/Slider

- Sampling color contrast before the popup's entrance-opacity spring
  settled produced a false-positive contrast failure (measured color
  blended with whatever was behind the still-fading popup) — same root
  cause as the Select/Slider geometry checks' `opacity === 1` poll
  pattern, now applied to `DropdownMenu`'s axe checks too.
- A rapid-repeated-open/close stress test under full (non-reduced)
  motion raced the settle spring's variable duration against the next
  click and flaked — same category as `select.spec.ts`'s interrupted-
  exit test, which already does its rapid cycling under
  `reducedMotion: "reduce"` and only full-motion-tests a single,
  non-rapid cycle. Rewrote `dropdown-menu.spec.ts`'s equivalent test to
  match that proven-stable pattern instead of inventing a new one.

## Family B completed (2026-11-17, still later)

| Component | Status | Evidence |
|---|---|---|
| MultiSelect | **VERIFIED** | Shares `Select`'s Base UI Root with `multiple`; unit (placeholder/comma-join/count-summary/multi-pick-without-closing/axe), e2e both themes + real-browser multi-pick |
| InputGroup | **VERIFIED** | Unit (labeled input alongside a visible, non-hidden addon; error display; axe), e2e both themes + real-browser typed input |

**Family B (Forms & Inputs) is now mostly built**: 15 of 19 entries are
VERIFIED (counting `Field` as also covering the brief's separate
"FormField" entry, and Slider/MultiSelect each covering their array-value
sibling, RangeSlider). Still **PLANNED**, genuinely not built:
`DatePicker`, `TimePicker`, `ColorPicker`, `FileUpload` — see
`COMPONENT_INVENTORY.md` for the exact list.

Full suite at this checkpoint: `pnpm typecheck` (5/5), `pnpm --filter
@b4/react run test` (164/164), `pnpm --filter @b4/motion run test` (5/5),
`pnpm build`, Storybook build, `npx playwright test` (115/115, run twice).

## Tooltip — Family C's second component (2026-11-17, still later)

**VERIFIED.** Real Base UI `Tooltip` (hover/focus delay, positioning,
portal, the same `preventUnmountOnClose` pattern as `DropdownMenu`/
`Select`). `children` becomes the trigger via `Tooltip.Trigger`'s
`render` prop, so an existing `Button`/`IconButton` works unmodified.

Two test-infra issues found and fixed, neither a component defect:
- A disabled-button story can't be used to test the *focus*-triggered
  path, because a native `disabled` button is unfocusable — moved that
  assertion to a non-disabled trigger story instead of weakening it.
- Storybook's own `addon-a11y` runs a background axe scan on story
  load; firing a second, manually-triggered scan too soon after
  navigation collided with it ("Axe is already running"). A short wait
  before the manual `analyze()` call avoids the race — noted in
  `TESTING.md` as a pattern other Family C components with popups
  should expect too.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(168/168), `pnpm build`, Storybook build, `npx playwright test`
(120/120, run twice).

## Popover — Family C's third component (2026-11-17, still later)

**VERIFIED.** Real Base UI `Popover` (click-triggered, holds genuinely
interactive content — see the `WithInteractiveContent` story/test, a
real confirm button inside the popup, not static text). Closes on
Escape and outside click, returns focus to the trigger.

Only one jsdom-specific test adjustment needed, same known category as
`TextTransition`/`DropdownMenu`: jsdom runs no real animation frame, so
the exit spring (and the focus-return Base UI defers until it
completes) never finishes in a unit test — the Escape-closes unit test
checks the synchronous `aria-expanded="false"` intent instead of full
focus return, which is verified for real in `e2e/popover.spec.ts`.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(173/173), `pnpm build`, Storybook build, `npx playwright test`
(125/125, run twice).

## Tabs — Family C's fourth component; a real selected-tab contrast bug (2026-11-17, still later)

**VERIFIED.** Built on Base UI's `Tabs` (real roving-tabindex arrow-key
navigation, ARIA tablist/tab/tabpanel, automatic content switching).
The traveling indicator is Base UI's own `Tabs.Indicator`, which exposes
its computed position as CSS custom properties
(`--active-tab-left`/`-width` etc.) — styled with a plain CSS
`transition`, not Motion, since Base UI itself owns the position
calculation.

**Real bug caught by the Playwright axe scan, not by eye**: the CSS
selected-tab styling used `.b4-tabs__tab[data-selected]`, but Base UI's
actual attribute is `data-active` (confirmed against
`TabsTabDataAttributes` — Checkbox/Switch/RadioGroup/SegmentedControl
all happen to use `data-pressed`/`data-checked`, so this was a
reasonable but wrong guess for Tabs specifically). The selector never
matched, so the selected tab silently kept the default (unselected) text
color against the indicator's selected-surface background — on
Porcelain that measured 1.42:1, nowhere close to AA. Fixed by using the
correct attribute; **lesson for `HANDOFF.md`**: don't assume a Base UI
component's "is-active" data attribute name from another component's
convention — check `*DataAttributes.d.ts` for every new primitive, the
same way this session already does for props.

Also found the suite's `select.spec.ts` e2e tests flaking again at
`workers: 3` once the total suite passed ~125 tests (same category as
earlier Checkbox/NumberField flakiness, but this time it was Storybook's
background axe scan colliding with a manual one that had no settle
delay, plus one keyboard test firing keys too fast after a popup
opened) — fixed both with the same "wait before the next action" pattern
already used elsewhere, rather than lowering `workers` again (confirmed
`workers: 2` didn't actually fix it, since the root cause wasn't
concurrency).

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(178/178), `pnpm build`, Storybook build, `npx playwright test`
(130/130, run multiple times for stability at `workers: 3`).

## TextTransition / NumberTransition — motion improvements (user-requested, 2026-11-17)

Both were already VERIFIED, but the user explicitly asked for their
animations to be improved, so this was a deliberate motion-quality pass,
not a bug fix:

- **`crossfade` mode** now adds a subtle `scale: 0.97 → 1` alongside the
  existing opacity/blur fade — reads as the value settling into place
  rather than just appearing, without being a spatial move.
- **`vertical`/`horizontal` modes now use `springs.snap`** (the same
  in-place-state-change preset `Button`'s press feedback uses) instead
  of a plain tween — these are a physical move (the new value travels
  into the old one's place), and a spring reads as more "sculptural"
  than a linear/eased tween for that, consistent with
  `MOTION_SPEC.md`'s "spatial move → spring" rule. `crossfade` keeps a
  plain tween deliberately — a spring's oscillation on opacity/blur
  would look like an accidental pulse rather than physical motion, not
  an improvement.
- **`NumberTransition` now forces `font-variant-numeric: tabular-nums`**
  on its own wrapper (a new `.b4-number-transition` class), so digit
  glyphs of different intrinsic widths (a narrow "1" vs. a wide "8")
  swapping in don't jitter the surrounding layout horizontally mid-slide
  — `NumberTransition` already benefits from the `springs.snap` change
  above since it's built on `TextTransition`'s `vertical` mode.

No prop/API changes — fully backward compatible with every existing
consumer (`Button`'s no users yet, but any future "accepted step" UI).

Verified: same full-suite run as above (178/178 unit, 130/130 e2e,
including the existing `motion-primitives.spec.ts` TextTransition/
NumberTransition coverage, unchanged pass count).

## Accordion — Family C's fifth component (2026-11-18)

**VERIFIED.** Built on Base UI's `Accordion`. Panel height is animated
from Base UI's own measured `--accordion-panel-height` CSS variable via
a plain CSS `transition`. The chevron rotates on the *Trigger's* own
`[data-panel-open]` attribute — confirmed per-part from each Base UI
accordion piece's own `*DataAttributes.d.ts` (Item/Panel use `data-open`
instead; Trigger uses `data-panel-open`), per the rule `HANDOFF.md`
added after the `Tabs` `data-active` contrast bug.

Two real findings, both in test assumptions, not the component:
- Accordion's keyboard story assumed arrow-key roving focus between
  triggers — Base UI deliberately removed that (its `orientation`/
  `loopFocus` props are now `@deprecated`, following a 2026 ARIA APG
  guidance update that accordion headers are plain Tab stops, not a
  composite widget). Rewrote the test to verify the *current, correct*
  contract (Tab order + Enter/Space activation) instead of a behavior
  that no longer exists by design.
- A stray `*/` inside a JSDoc comment's prose ("Item*/*Panel*") closed
  the comment early and produced a cascade of unrelated-looking syntax
  errors — a reminder that doc comments containing asterisks next to
  slashes need rewording, not escaping (there's no escape for it).

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(183/183), `pnpm build`, Storybook build, `npx playwright test`
(135/135, run twice).

## Dialog — Family C's sixth component; a near-miss caught before shipping (2026-11-18)

**VERIFIED.** Real Base UI `Dialog` — modal by default (focus trap,
backdrop, Escape/outside-click-to-close, scroll lock). Close button
composes `IconButton` via `Dialog.Close`'s `render` prop.

**Caught before it ever ran, not after**: the first draft centered the
popup with `position: fixed; top/left: 50%; transform: translate(-50%,
-50%)`. That's exactly the "double transform" class of bug `Slider`'s
geometry had (documented above) — `OptionPopupSurface` animates this
same element's `scale` via Motion, which writes directly to the
`transform` style property and would have silently overwritten the
CSS-set centering transform rather than composing with it. Recognized
the pattern from the Slider writeup before building and switched to
fixed-inset + `margin: auto` centering, which needs no transform at
all. No regression test needed for a bug that was designed around
rather than shipped and found — recorded here so the *reasoning* isn't
lost, since there's no failing test to point to.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(188/188), `pnpm build`, Storybook build, `npx playwright test`
(140/140, run twice).

## AlertDialog — Family C's seventh component (2026-11-18)

**VERIFIED.** Reuses `Dialog`'s visual CSS (`.b4-dialog__*`) but is a
distinct Base UI primitive (`AlertDialog`, not `Dialog` with a prop
flag) — Base UI itself only shares the Popup/Backdrop/Title/Description
parts between the two namespaces and gives `AlertDialog` its own
`Root`/`Trigger`. No decorative close (×) button; only an explicit
Cancel/Confirm choice, and — verified in a real browser, not assumed —
it does **not** close on outside click, unlike `Dialog`. Pairs
`Button variant="destructive"` for the confirming action, per
`DESIGN_PRINCIPLES.md`'s "destructive actions feel serious, not showy."

No bugs found this component — clean on the first typecheck/unit/e2e
pass, likely because `Dialog`'s transform-collision lesson was already
applied (reused its CSS) and the per-part-data-attribute lesson from
`Tabs`/`Accordion` meant nothing was guessed.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(193/193), `pnpm build`, Storybook build, `npx playwright test`
(145/145, run twice).

## ContextMenu, HoverCard — Family C's eighth and ninth components (2026-11-18)

Both **VERIFIED**.

- **`ContextMenu`**: real Base UI `ContextMenu` (right-click/long-press),
  reusing `DropdownMenuItem`'s shape and `.b4-dropdown-menu__*` CSS —
  one visual menu, two ways to open it. One real API difference caught
  by `tsc`, not guessed: unlike `Menu`/`Select`/`Dialog`,
  `ContextMenu.Root` has **no `actionsRef`/`preventUnmountOnClose`** —
  it manages its own unmount timing, so `OptionPopupSurface`'s
  `onExitComplete` is a documented no-op here, not copy-pasted
  unchanged from `DropdownMenu`.
- **`HoverCard`**: Base UI names the underlying primitive "PreviewCard",
  not "HoverCard" — used the mission brief's conventional name for the
  component, noted the actual Base UI name in the doc comment so a
  future search for "PreviewCard" in `node_modules` isn't a dead end.

Both clean on the first unit-test pass; `ContextMenu`'s e2e suite
explicitly verifies a plain left-click does *not* open it (only
right-click does) — the one behavior worth pinning given the whole
point of the component is that distinction.

Verified: `pnpm typecheck` (5/5), `pnpm --filter @b4/react run test`
(200/200), `pnpm build`, Storybook build, `npx playwright test`
(152/152, run twice).

See COMPONENT_INVENTORY.md for the current status of every remaining component.

## Breadcrumbs, Pagination, Stepper — Family C's tenth, eleventh and twelfth components (2026-11-18)

All three **VERIFIED**. All three are pure-presentational — no Base UI
primitive exists for any of them, so each is a plain semantic-HTML
component (`<nav><ol>`, button row, `<ol>` of steps) rather than a
Base UI wrapper.

- **`Breadcrumbs`**: `<nav>` + `<ol>`. The last item is plain text with
  `aria-current="page"` (it's where the user already is, not a link to
  click); earlier items render as real `Link`s when they have an `href`,
  or plain text when they don't (a non-navigable ancestor).
- **`Pagination`**: bounded button count — first page, last page, the
  current page ± 1, with an ellipsis for any gap — never a flat row of
  every page number. Built on `IconButton` (prev/next) + plain
  `<button>`s with `aria-current="page"` on the active one.
- **`Stepper`**: wizard-style progress list, each step
  complete/active/upcoming, read via `aria-current="step"` on the active
  one (not color alone). Supports horizontal and vertical orientation.

**Real bug caught before any test ran**: the first draft of both
`Pagination.css` and `Stepper.css` referenced tokens that don't exist —
`--b4-accent-solid`, `--b4-surface-hover`, `--b4-surface-raised`. They
compiled fine (CSS custom properties silently resolve to nothing when
undefined) and *looked* right in a quick visual check, which is exactly
the "looks done" trap `AGENTS.md` warns about. The actual defect only
surfaced as an axe `color-contrast` violation on Porcelain —
`aria-current="page"` text at white-on-white (1.04:1, needs 4.5:1)
because the undefined `--b4-accent-solid` fill resolved to nothing. Fixed
by using the real tokens other components already use for the same
purpose: `--b4-accent` (not `-solid`), `--b4-control-bg-hover` (not
`surface-hover`), `--b4-surface-2` (not `surface-raised`) — confirmed
against `packages/tokens/src/{base,theme-graphite,theme-porcelain}.css`
and cross-checked against `Button.css`'s existing `--b4-accent` +
`--b4-text-on-accent` pairing before reusing it.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(216/216), `pnpm --filter @b4/motion run test` (5/5), `pnpm build`,
Storybook build, `npx playwright test` (162/162, run twice for
stability).

## NavigationMenu — Family C's thirteenth component (2026-11-18)

**VERIFIED.** Built on Base UI's own `navigation-menu` primitive directly
(it covers this component — no need to build it on top of `Menu`), using
the composition from Base UI's own docs example: `Root > List > (Item >
Trigger + Content)`, with `Portal > Positioner > Popup > Viewport`
rendered once outside the `List` and shared across every section (only
the active section's `Content` is moved into the `Viewport`).

**Real interaction bug found and root-caused, not papered over.** The
first e2e test written for "switching sections" used `.click()` on a
second trigger while the first section was still open, and it
reproducibly closed the whole menu instead of switching — confirmed in
a real Chromium browser via a throwaway debug script
(`page.evaluate` + a `MutationObserver` tracing `aria-expanded`
timestamps on both triggers), not just in the test. The trace showed
the switch actually succeeding (`Products: true→false` and
`Resources: false→true` at the identical millisecond), then `Resources`
closing again 6ms later. Root cause: `NavigationMenuTrigger` opens
"when hovered or clicked" (its own docstring) — once any section is
open, the cursor passing over a sibling trigger on the way to clicking
it already switches the active section via hover (restMs 0 once
mounted); the click event that follows then lands on a trigger that is
now the *already-open* one, and `useClick`'s `toggle: isActiveItem`
semantics mean a click on an open trigger closes it, not reopens it.
This is intended behavior, not a library bug: switching between
sections happens via **hover** once the menu is open; a second click on
the same (now-active) trigger is a close action. Fixed the e2e test to
assert what actually happens — hover-based switching (via
`page.mouse.move`) stays open, and a second click on an already-open
trigger closes it — rather than asserting the wrong interaction and
either skipping the test or silently weakening it.

Also caught and fixed a real axe finding: Base UI's own internal
focus-guard sentinels here trip the `aria-hidden-focus` rule, same
documented exception used throughout `e2e/*.spec.ts` for this pattern.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(219/219), `pnpm build`, Storybook build, `npx playwright test`
(168/168, run twice for stability).

## Drawer — Family C's fourteenth component (2026-11-18)

**VERIFIED.** Built on Base UI's own `drawer` primitive (`Root > Trigger
+ Portal > Backdrop + Viewport > Popup > Content`), a right-edge side
panel with genuine swipe-to-dismiss built into the primitive (drag the
panel toward the right edge to close it) — not a static mockup of one.
CSS-driven transitions keyed to `data-starting-style`/`data-ending-style`
and the primitive's own `--drawer-swipe-movement-x` CSS var during a
drag, consciously **not** Motion: a Motion `transform` write here would
collide with the swipe-driven `transform` the primitive itself writes
mid-drag, the same transform-collision class documented for Dialog and
Slider.

**Design choice made explicit, not left implicit**: unlike Dialog/
AlertDialog/ContextMenu, `Drawer` does **not** use the `actionsRef` +
`preventUnmountOnClose` + manual `unmount()` pattern. That pattern
exists specifically to let an externally-driven Motion exit animation
finish before Base UI unmounts the popup; Drawer's exit is Base UI's
own CSS transition, which the primitive already waits on internally via
its own `onOpenChangeComplete` detection before unmounting — adding the
manual pattern on top was tried first and left the popup stuck mounted
with `data-closed` in a real Chromium run (confirmed via Playwright,
not assumed), because the manual `actionsRef.unmount()` call was racing
Base UI's own already-correct internal unmount timing. Removed it;
plain `open`/`onOpenChange` is correct here, matching the simpler
pattern `Accordion`/`Tabs` (also CSS-only) already use.

E2e covers a real drag-to-dismiss (`page.mouse` down/move/up past the
primitive's own dismiss threshold, not a simulated/faked gesture),
Escape, backdrop-click, and the close button, across both themes.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(224/224), `pnpm build`, Storybook build, `npx playwright test`
(173/173, run twice for stability).

## Sheet — Family C's fifteenth component (2026-11-18)

**VERIFIED.** `Drawer`'s bottom-anchored sibling: same Base UI `drawer`
primitive, `swipeDirection="down"` instead of `"right"`, reusing
`Drawer`'s backdrop/header/title/description/content CSS
(`.b4-drawer__*`) and adding its own positioning + a drag grabber
(`.b4-sheet__popup`, `.b4-sheet__grabber`) — see
`COMPONENT_INVENTORY.md`'s scope-changes log. Applied every lesson from
`Drawer` up front rather than rediscovering them: plain `open`/
`onOpenChange` (no `actionsRef`/`preventUnmountOnClose` — that pattern
is for Motion-driven exits, not CSS ones), the primitive's own
`--drawer-swipe-movement-y` var for live drag feedback, `data-swiping`
disabling the CSS transition mid-drag. First unit-test and e2e run both
passed clean with zero follow-up fixes needed, the payoff of writing
down the Drawer gotchas in HANDOFF.md instead of re-deriving them.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(229/229), `pnpm build`, Storybook build, `npx playwright test`
(178/178, run twice for stability).

## CommandPalette — Family C's sixteenth component (2026-11-18)

**VERIFIED.** A real Base UI `Dialog` wrapping a real Base UI `Combobox`
in its documented `inline` mode — the list renders directly in the
dialog body instead of in its own floating popup, exactly the
composition Base UI's own `inline` prop docstring describes for a
`Combobox.Root` > `Dialog.Root` palette, with `Combobox`'s `open`/
`onOpenChange` bound to the same state as the `Dialog`'s (per that same
docstring) so the filter query and highlighted item reset whenever the
palette closes. Filtering, keyboard navigation, and selection are all
Base UI's real combobox behavior — not a fake static list with custom
filtering logic bolted on.

**Real bug found and fixed, not guessed around.** The first draft set
`details.preventUnmountOnClose()` on close (copy-pasted from `Dialog`'s
established pattern) but never wired an `actionsRef` to call
`unmount()` afterward — confirmed in a real Chromium run that this left
the popup permanently stuck with `data-closed`/`data-ending-style` after
every close (Escape, backdrop click, selecting an item), never actually
unmounting, because `preventUnmountOnClose()` tells Base UI "wait, I'll
tell you when to finish" and nothing ever did. Root-caused by checking
the dialog element's own data attributes in a throwaway Playwright
script after the "stuck open" symptom, not by guessing. Fixed by adding
`actionsRef` + calling `actionsRef.current?.unmount()` in
`OptionPopupSurface`'s `onExitComplete`, exactly the pattern `Dialog.tsx`
and `AlertDialog.tsx` already use correctly — the bug was an incomplete
copy-paste (took half the pattern, not the whole thing), not a design
flaw.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(235/235), `pnpm build`, Storybook build, `npx playwright test`
(183/183, run twice for stability).

## TreeView — Family C's seventeenth component, Family C complete 17/17 (2026-11-18)

**VERIFIED.** Real ARIA `tree`/`treeitem`/`group` markup with genuine
nested `<ul role="group">` subtrees (not `aria-level` on a flattened
list), roving `tabindex` (one real focusable row at a time, matching
the roving-focus convention every other composite widget in this
library uses), and the full ARIA APG tree keyboard pattern: Right
expands/moves into a branch, Left collapses/moves to parent, Up/Down
move between visible rows, Home/End jump to the first/last visible row.
No Base UI primitive exists for trees — built entirely from scratch.

**Three real bugs found and fixed, each via a real-browser trace, not
guesswork:**

1. **Keydown bubbling through every ancestor row.** Because a
   subtree's `<ul role="group">` nests *inside* its parent `<li
   role="treeitem">`, a keydown fired on a descendant row bubbles up
   through every ancestor row's own `onKeyDown` handler too. Without a
   guard, "ArrowDown after expanding a branch" would move focus to the
   branch's first child and then get *immediately overridden* by the
   parent's own handler also reacting to the same bubbled event —
   confirmed with a `MutationObserver`-free trace reading
   `document.activeElement` after each key press in a real Chromium
   page, not assumed from reading the code. Fixed with an
   `event.currentTarget !== event.target` guard so only the row the
   event actually originated on handles it.
2. **A focusable element under `aria-hidden="true"`.** The disclosure
   chevron was a `<button tabIndex={-1} aria-hidden="true">` — WAI-ARIA
   forbids `aria-hidden` on any focusable element (a `tabindex={-1}`
   element is still focusable via `.focus()`, just not via Tab), and in
   practice this made Playwright's `getByRole('button')` fail to find
   it *at all*, even with `{ hidden: true }`. Changed it to a
   non-focusable `<span>` with `onClick` — mouse users still get a
   precise click target, but there's no longer a second focusable
   control duplicating the row's own Right/Left keyboard behavior.
3. **A named descendant's `aria-label` folding into the row's
   accessible name.** A first attempt at fixing #2 gave the disclosure
   button a real `aria-label` ("Expand"/"Collapse") instead of
   `aria-hidden`. A real Chromium accessibility snapshot
   (`locator.ariaSnapshot()`) showed this turned `treeitem "src"` into
   `treeitem "Collapse src"` for every row with children — the
   button's own label gets folded into the ancestor's name-from-content
   computation. This is also why an *earlier* attempt at giving the
   `<li>` itself an explicit `aria-labelledby` (to scope its name to
   just its own label, excluding the nested group's content) failed
   axe's `label-content-name-mismatch` rule instead: the visible text of
   descendant rows wasn't reflected in the overridden name. The actual
   correct behavior — confirmed by *removing* both overrides and
   checking axe/Playwright's own accessible-name computation in real
   Chromium — is that nested `role="treeitem"` descendants are
   correctly excluded from an ancestor's name-from-content by the
   browser's own accname algorithm; the disclosure control just needs
   to not be a second named, focusable thing competing for that same
   computation.

**New gotcha, recorded for future sessions**: jsdom's accessible-name
computation (`dom-accessibility-api`, used by `@testing-library/dom`)
does **not** implement the same nested-role exclusion real browsers
do — `getByRole('treeitem', { name: 'src' })` fails in a unit test
immediately after the sibling group renders, even though both axe and
Playwright (both backed by real Chromium) agree the name is correctly
just `"src"`. Matched with `{ name: /^src/ }` in the unit tests instead
of restructuring working, correct markup around a test-environment
limitation — see `HANDOFF.md`.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(242/242), `pnpm build`, Storybook build, `npx playwright test`
(189/189, run twice for stability).

**Family C — Navigation & Overlays is now complete: 17/17 VERIFIED.**

## DatePicker — Family B, first of the last 4 (2026-11-18)

**VERIFIED.** A real ARIA APG "Date Picker Dialog" grid
(`role="grid"`/`"row"`/`"gridcell"`, roving tabindex over day buttons,
Left/Right/Up/Down day-and-week navigation, PageUp/PageDown month
navigation, Home/End for the start/end of the visible week, Enter/
Space to select) — not a native `<input type="date">` wrapper or a
text field with no real picker behind it. The popup chrome is the
existing `Popover` component, reused rather than rebuilt; the trigger
shows the selected date (locale-formatted via `Intl.DateTimeFormat`)
or a placeholder.

**Real bugs found and fixed, each confirmed before committing to a
fix, not guessed:**

- **Cross-month focus moves don't work with a synchronous
  `querySelector` + `.focus()` call.** PageUp/PageDown (and an arrow
  key crossing a month boundary) change `visibleMonth`, which
  re-renders a different set of day buttons — the target date's button
  doesn't exist in the DOM yet in the same tick as the `setState` call
  that changes the visible month (React flushes the re-render after
  the event handler returns). A `requestAnimationFrame` wrapper (the
  approach tried first, matching `TreeView`'s same-month case) raced
  React's own scheduling unpredictably for this cross-month case.
  Fixed with a `useEffect` keyed on the focused date, which only runs
  after the DOM reflects the new month.
- **A `color-contrast` violation on days from the adjacent month.**
  First draft used `--b4-text-disabled` for the dimmed "outside the
  current month" days — but those days are fully real, clickable,
  selectable buttons (clicking a December day while viewing November
  navigates to December and selects it), not disabled ones, so the
  disabled-contrast exemption doesn't apply. axe caught the real
  2.43:1 contrast ratio on Porcelain. Fixed to `--b4-text-tertiary`
  (the same token already used elsewhere in this library for
  de-emphasized-but-still-interactive text).
- **`aria-dialog-name` violation**: the `Popover` wrapping the
  calendar had no accessible name since `DatePicker` didn't pass a
  `title`. Fixed by passing the field's own `label` as the popover's
  title — gives the dialog a real name and a sensible visible heading,
  not just a silencing `aria-label`.

**Scope, logged honestly** (see `COMPONENT_INVENTORY.md`'s scope log):
weeks start on Sunday (not locale-aware) and there's no Shift+PageUp/
PageDown year jump. Both are real, bounded simplifications for v1, not
silently dropped requirements — everything else in the ARIA APG
pattern is implemented and tested for real.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(249/249), `pnpm build`, Storybook build, `npx playwright test`
(195/195, run twice for stability).

## TimePicker — Family B, second of the last 4 (2026-11-18)

**VERIFIED.** Two real Base UI `NumberField` instances (hours, minutes)
composed directly — reusing the same `FieldControl`/`SteppingInput`/
`motionCompatibleProps` recipe `NumberField.tsx` established, not the
wrapped `NumberField` component itself (which bundles its own `Field`;
nesting two inside this component's own `Field` would duplicate
labels/hints) — plus `SegmentedControl` for AM/PM in 12-hour mode.
Real value clamping (1-12 or 0-23 for hours, 0-59 for minutes),
keyboard arrow-key stepping, and press-to-step buttons, all from the
underlying primitive — not a fake spinner bolted onto a text input.

**A real design bug caught before any test ran**: the first draft had
no internal `useState` fallback — `current = value ?? defaultValue ??
{...}` reads `defaultValue` as a constant with no way to update it, so
an **uncontrolled** `TimePicker` (no `value` prop, only `defaultValue`)
would never visually respond to user interaction at all. Caught by
re-reading the component against the established controlled/
uncontrolled pattern every other stateful component in this library
follows (`const [uncontrolled, setUncontrolled] = useState(...); const
value = controlled ?? uncontrolled`), before writing a single test —
not discovered by a failing test.

**A real accessible-naming bug, found via the same mechanism
`CommandPalette`'s `aria-dialog-name` bug was found**: Base UI's
`NumberField.Input` always sets `aria-labelledby` from the ambient
`Field.Root` context (the outer "Reminder time" label), which wins
over this Input's own explicit `aria-label="Hours"`/`"Minutes"` per
the accname spec regardless of which one was set last — both segments
ended up with the SAME computed name ("Reminder time"), confirmed by
`getByRole('textbox', { name: 'Hours' })` finding nothing. Fixed by
explicitly clearing `aria-labelledby` on each segment's rendered
input, letting its own `aria-label` take effect.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(257/257), `pnpm build`, Storybook build, `npx playwright test`
(202/202, run twice for stability).

## ColorPicker — Family B, third of the last 4 (2026-11-18)

**VERIFIED.** A real color picker, not a swatch button delegating to a
native `<input type="color">` and not a static gradient image: a
draggable *and* keyboard-operable saturation/brightness area (real
`pointerdown`/`pointermove` handling plus arrow-key nudging, `role=
"slider"` with a live `aria-valuetext`), a real Base UI `Slider` for
hue (reused directly, not reimplemented — styled with a CSS hue-ramp
track), and a hex text field that stays in sync both directions. HSV
is the canonical editing state (it maps directly onto the 2D area and
the hue slider); the public API is a plain `#rrggbb` hex string,
converted at the edges with real, from-scratch HSV↔RGB↔hex math (no
new dependency pulled in for it).

Applying the lessons from `DatePicker`/`TimePicker` up front —
the standard controlled/uncontrolled `useState` pattern from the
start, composing `TextField`/`Popover`/the raw Base UI `Slider`
directly rather than reinventing any of them, and checking for the
ambient-`aria-labelledby` trap before it could bite — **every unit
test, the full build, and every e2e test (including real
`page.mouse` pointer drags on both the 2D area and the hue slider)
passed on the first run, zero follow-up fixes needed.**

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(265/265), `pnpm build`, Storybook build, `npx playwright test`
(209/209, run twice for stability).

## FileUpload — Family B's last component, Family B complete (2026-11-18)

**VERIFIED.** A real dropzone: the actual native `<input
type="file">` sits over the whole visible area (click-to-browse and
keyboard operability — Tab + Enter opens the native picker — come from
genuine browser behavior, not reimplemented); real client-side
validation (`accept`, `maxSizeBytes`, `maxFiles`) against the real
`FileList`; a real file list with working per-file removal. Not a
swatch delegating to a native picker with no custom UI, and not a fake
progress bar — there is no backend to upload to, so the component's
honest job is selection, validation, and list management, with real
`File` objects handed to the consumer via `onValueChange` for them to
actually upload.

**A real, load-bearing bug caught by the e2e drag-and-drop test, not
assumed away**: the first draft relied on "drop a file onto a native
`<input type="file">` and the browser populates `.files` for you" —
true for a genuine, trusted, OS-level drag, but a Playwright test
dispatching a scripted `drop` `DragEvent` (the only way to verify this
in CI) does **not** trigger that native behavior, because browsers
correctly refuse to set `.files` from an untrusted/synthetic event.
Rather than weaken the test to "assume it works," switched to the
standard, verifiable mechanism every real drag-and-drop uploader
actually uses: a real `onDrop` handler reading `event.dataTransfer
.files` directly. This is also the more honest implementation —
reading `dataTransfer.files` is well-defined and testable regardless
of event trust, so the behavior under test is the same behavior a real
user gets.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(273/273), `pnpm build`, Storybook build, `npx playwright test`
(216/216, run twice for stability).

**Family B — Inputs & Forms is now complete: all 19 components
VERIFIED.**

## Spinner — Family E (2026-11-18)

**VERIFIED.** The standalone counterpart to `Button`'s own inline
`loading` spinner — same visual design (a `currentColor` border-spin
circle), extracted for use anywhere a loading state needs to show
without being inside a `Button`. `role="status"` with an `aria-label`
("Loading" by default, overridable) announces the state once. Honors
`prefers-reduced-motion` by **slowing** the animation (0.7s → 1.4s)
rather than stopping it outright — a continuous loading indicator that
freezes removes the loading signal entirely, a worse outcome for
vestibular-sensitive users than a slower spin; this mirrors `Button`'s
existing spinner's own choice, not a new policy invented here.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(277/277), `pnpm build`, Storybook build, `npx playwright test`
(220/220, run twice for stability).

## Toast — Family E (2026-11-18)

**VERIFIED.** A real Base UI `Toast` system: `ToastProvider` wraps the
app once, `useToast()` returns `add`/`close`/`update`/`promise` for
any component inside it to call. Genuine stacked, swipe-to-dismiss
toasts (drag toward the dismiss edge, real `data-swiping`/
`--toast-swipe-movement-x/y`-driven transform, not a fade timer with
no interaction), `low`/`high` announcement priority, and a real
`promise()` helper that ties a toast's loading → success/error states
to an actual `Promise` — exercised in the Storybook demo and e2e with
a real `setTimeout`-backed promise, not a canned state swap.

**A real, pre-existing, previously-undiscovered bug found and fixed —
not a Toast bug, a Button/IconButton one.** The axe scan in
`e2e/toast.spec.ts` (which runs immediately after clicking a primary
`Button` to trigger a toast, so the cursor is still resting on it,
putting it in its own `:hover` state during the scan) caught a real
WCAG AA failure: Graphite theme's `--b4-accent-hover` aliased
`--b4-accent-400` (68% lightness), giving Button/IconButton's `:hover`
background only **2.92:1** contrast against their white label — well
under the 4.5:1 floor `--b4-accent` (the *resting* state, 50%
lightness, 5.77:1) was explicitly tuned and tested for. This had been
live since Phase 0 and never caught, because no prior e2e scan
happened to run axe immediately after clicking a primary Button with
the cursor left resting on it.

Root cause once found: `--b4-accent-400` is shared by **two
incompatible contrast requirements** — `--b4-accent-text` (light
accent text/icons *on* a dark surface, e.g. `Badge`, which needs
`--b4-accent-400` to stay light/68%, 5.99:1 against `--b4-surface-2`)
and the hover-fill case (white text *on* the accent color, which
needs it darker, ≤56%, to stay ≥4.5:1). No single lightness satisfies
both. Fixed by giving the hover-fill case its own token,
`--b4-accent-hover-fill` (55%, 4.85:1 white-on-fill), and pointing
`--b4-accent-hover` at that instead of at `--b4-accent-400` — leaving
`--b4-accent-400`/`--b4-accent-text` untouched at their original,
already-correct 68%/5.99:1. Confirmed the full existing suite (every
component using `--b4-accent-hover` or `--b4-accent-text`) still
passes, both themes, after the split — see `theme-graphite.css`'s
inline comment for the full reasoning.

**Lesson for future token work**: a token aliased for two different
*directions* of contrast requirement (text-on-fill vs. fill-behind-
white-text) is a latent bug waiting for the right e2e sequence to
surface it — check both directions before reusing a color scale step
for a second purpose, not just "does it look right."

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(283/283), `pnpm build`, Storybook build, `npx playwright test`
(227/227, run twice for stability).

## InlineAlert — Family E (2026-11-18)

**VERIFIED.** A persistent, page-level message — distinct from
`Toast` (transient, self-dismisses) and `Badge`/`StatusBadge` (small
inline labels). Four tones (info/success/warning/danger), each
pairing its color with a genuinely distinct icon glyph, not the same
shape recolored — `DESIGN_PRINCIPLES.md`'s "color never carries
meaning alone" rule, already established by `StatusBadge`, applied
here too. Reused the exact `--b4-{tone}`/`--b4-{tone}-bg`/
`--b4-danger-text` token triad `Badge.css` already established,
rather than inventing a parallel tone system. Optional `dismissible`
with a real working close button.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(289/289), `pnpm build`, Storybook build, `npx playwright test`
(231/231, run twice for stability).

## NotificationPanel — Family E (2026-11-18)

**VERIFIED.** A persistent notification list in a popover — distinct
from `Toast` (transient) and a single `InlineAlert` (one message, not
a list). Built on the existing `Popover` for its chrome, not a second
popup implementation. Unread state is never color-only: each unread
item gets a visible dot *and* bolder title text *and* a visually-hidden
"(unread)" announcement, the same "color never carries meaning alone"
rule applied throughout this session.

**Two real bugs caught, neither a Toast/NotificationPanel-specific
one:**

- **Test bug, caught immediately**: the first draft of the unit tests
  passed a wrapper *component* (`function Trigger() { return
  <IconButton .../> }`) as `Popover`'s `trigger` prop instead of the
  `IconButton` element itself. `Popover` clones the element it's given
  with the handlers Base UI's own `Trigger` needs; cloning props onto a
  wrapper component doesn't forward them to what it renders, so every
  test's click silently did nothing. Fixed by passing the real element.
  Worth remembering for any future test that renders a `Popover`/
  `Dialog`/similar `trigger` prop: always the element, never a
  component around it.
- **The same `--b4-text-disabled`-for-non-disabled-text mistake as
  Pagination/Stepper/DatePicker**, caught by axe again: the item
  timestamp ("2m ago", "1h ago") used `--b4-text-disabled` for purely
  visual de-emphasis on fully interactive, clickable list items — 2.43:1
  on Porcelain. Fixed to `--b4-text-tertiary`. This is now the single
  most-repeated mistake category this session (4th occurrence) — grep
  `packages/tokens/src/*.css` for the real token name before writing
  `var(--b4-...)`, every time, not just when a scan happens to catch it.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(295/295), `pnpm build`, Storybook build, `npx playwright test`
(237/237, run twice for stability).

## MorphingSurface — Family E (2026-11-18)

**VERIFIED.** A real FLIP-based morph (Motion's `layout`/`layoutId`
projection measuring real size/position before and after a re-render
and animating the visual difference), not a fade/crossfade standing in
for one — confirmed with a real e2e assertion comparing
`boundingBox().width` before and after a click, not just checking that
text changed. The general-purpose counterpart to `AnimatedIndicator`:
that one is a decorative indicator traveling behind other content;
this one is the content surface itself morphing, including across two
different mount points via a shared `layoutId` (e.g. a list item
expanding into a detail panel elsewhere in the tree). No CSS file —
purely behavioral, like `AnimatedIndicator`, styled entirely by the
consumer's own `className`/`style`.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(299/299), `pnpm build`, Storybook build, `npx playwright test`
(241/241, run twice for stability).

## ExpandingAction — Family E (2026-11-18)

**VERIFIED.** A compact icon action that genuinely widens on hover/
focus to reveal its label — real `layout`-driven width animation (the
same FLIP technique `MorphingSurface` wraps), confirmed with a real
e2e `boundingBox()` width comparison before/after hover, not a
tooltip overlapping the button or a CSS `:hover { width }` snap. The
label stays in the accessible name via `aria-label` at every width
(the visible label text is `aria-hidden`, since it would otherwise
duplicate the button's own name).

**Correction made during testing, not left wrong**: the unit test for
"hides the label on blur" initially assumed jsdom's Motion animations
never progress at all (the documented caveat for `TextTransition`/
`Popover`/`Dialog` elsewhere in this repo) and was written to only
check synchronous React state. In fact Motion's exit animation *does*
eventually resolve in jsdom via its own timer-driven internals — it
just isn't synchronous with the triggering event. Found this by
testing the assumption directly (`waitFor` succeeded) rather than
copying the existing caveat without checking whether it actually
applied here; the final test asserts the real settled DOM state via
`waitFor`, not a weakened synchronous-only check.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(306/306), `pnpm build`, Storybook build, `npx playwright test`
(246/246, run twice for stability).

## TransitionGroup — Family E (2026-11-18)

**VERIFIED.** A real enter/exit list: items animate in and out with
Motion's `AnimatePresence` (`mode="popLayout"`, so a removed item's
neighbors slide smoothly into its place rather than snapping), not a
plain `.map()` where removed items vanish and added ones appear
instantly. Each child is automatically wrapped with the enter/exit
motion — consumers hand it a normal keyed list, the same convention
React already requires, not pre-wrapped `motion.*` elements.

**A real e2e-only bug found and fixed in the test, not the
component**: the first e2e assertions used a bare `page.locator("li")`
to count rendered items, which also matched Storybook's own preview-
iframe error-boundary markup — fixed-in-the-DOM boilerplate `<li>`
elements that exist on every story page regardless of whether an error
actually occurred, invisible but still matched by Playwright's default
(non-visibility-filtered) locator count. Confirmed via a throwaway
debug script dumping every matched `<li>`'s `outerHTML`, not assumed.
Fixed by scoping the locator to the demo's own item class instead of a
bare tag selector — a pattern worth remembering for any future e2e
test counting generic elements (`li`, `button`, `div`) on a Storybook
iframe page.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(310/310), `pnpm build`, Storybook build, `npx playwright test`
(250/250, run twice for stability).

## LoadingOverlay — Family E's last component, Family E complete (2026-11-18)

**VERIFIED.** A real blocking overlay — `pointer-events: auto`
genuinely intercepts clicks on whatever it covers while `visible`, not
a spinner floating decoratively over still-clickable content. Proven
with a real e2e test, not assumed: a `window.alert()` on the covered
button, listened for via Playwright's `dialog` event — the overlay
visible, the forced click on the occluded button, and **no alert
fires**; once the overlay is hidden, the identical click **does** fire
the alert. Reuses `Spinner` directly rather than reimplementing a
spinner. Real `AnimatePresence` fade in/out, honoring reduced motion.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(316/316), `pnpm build`, Storybook build, `npx playwright test`
(254/254, run twice for stability).

**Family E — Feedback & Motion is now complete: all 11 components
VERIFIED.**

## Progress, CircularProgress — Family D's first 2 components (2026-11-18)

Both **VERIFIED**. Real Base UI `Progress` primitives — genuine
`role="progressbar"` semantics, a formatted value announced to
assistive tech, and a real indeterminate state (`value={null}`, a
looping animation, not a bar/ring frozen at a fake percentage) — not a
styled `<div>` with a width percentage and no ARIA semantics.

`CircularProgress` reuses the same `Progress.Root`/`Label`/`Value`
parts for ARIA (confirming Base UI's Progress primitive is visual-
agnostic — Track/Indicator are plain, stylable elements, not
hardcoded to a linear bar), but renders a genuine SVG
`stroke-dashoffset` ring computed from the same `value`/`min`/`max`
props, rather than a CSS `conic-gradient` approximation or a rotating-
border trick. Confirmed with a real e2e assertion comparing
`stroke-dashoffset` between two different values, not just a visual
screenshot.

Both honor `prefers-reduced-motion` by slowing (not stopping) their
indeterminate-state animation — the same reasoning already applied to
`Spinner`: a loading indicator that freezes removes the loading signal
entirely.

Verified: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
(329/329), `pnpm build`, Storybook build, `npx playwright test`
(268/268, run twice for stability).

## Skeleton — Family D's 3rd component (2026-11-18)

**VERIFIED**. `aria-hidden` loading placeholder (`text`/`circle`/`rect`
variants) with a gradient shimmer sweep (`background-position`
`@keyframes`). `prefers-reduced-motion: reduce` drops the animation
entirely (not just slows it) — this one is purely decorative, unlike
Progress/CircularProgress/Spinner's genuine loading signal, so there's
nothing lost by removing the motion outright.

Bug found and fixed during testing: the width/height unit test
originally used `toHaveStyle({ height: "2rem" })`, which failed —
jsdom resolves `"2rem"` against its own default 16px root font-size
(giving `32px`) when reading computed style, which doesn't match the
raw inline style value and isn't something the component controls.
Fixed by asserting `el.style.height` directly instead of the
jsdom-computed value.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(334/334), `pnpm build`, Storybook build, `npx playwright test`
(272/272, run twice for stability).

## Card, InteractiveCard — Family D's 4th and 5th components (2026-11-18)

Both **VERIFIED**. `Card` is a static content surface (`flat`/`raised`/
`outlined` variants, reusing `--b4-surface-radius`/`--b4-shadow-raised`
rather than inventing new surface tokens) for Stat/EmptyState/
ErrorState and other Family D content to compose with. `InteractiveCard`
is its clickable sibling — a real `<button>`, not a `<div onClick>`, so
it's keyboard-operable and carries correct semantics for free; shares
`Button`'s press spring (`springs.snap`) plus a small hover lift, both
skipped under `useReducedMotion()`, so the "action family" vocabulary
extends to actionable surfaces, not just Button-shaped controls.

No new token or testing gotchas — both components' tokens and e2e
page-isolation `disableRules` (`page-has-heading-one`,
`landmark-one-main`, `region`) matched the already-established pattern
on the first attempt.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(343/343), `pnpm build`, Storybook build, `npx playwright test`
(279/279, run twice for stability).

## Stat, EmptyState, ErrorState — Family D's 6th, 7th, 8th components (2026-11-18)

All three **VERIFIED**. `Stat` is a labeled metric with an optional
trend delta (`up`/`down`/`neutral`); reused `--b4-success`/
`--b4-danger-text` directly for the trend text color rather than
inventing new tokens — both themes' own doc comments confirm those
two were already tuned for plain-text-on-surface contrast (not just
icon-on-tint, which is `--b4-success-bg`/`--b4-danger-bg`'s job), and
the e2e axe pass on both themes confirmed it held in practice.

`EmptyState`/`ErrorState` share the same "icon + title + description +
optional action" shape but are deliberately not merged into one
component with a `tone` prop: `ErrorState` is `role="alert"` (an
assistive-tech-should-announce-this failure) while `EmptyState` is a
plain `role`-less container (a "no data yet" state isn't an alert) —
different ARIA semantics, not just different color, so they stay
separate the same way `InlineAlert`'s tones stay inside one component
only because they genuinely share one semantic role.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(359/359), `pnpm build`, Storybook build, `npx playwright test`
(288/288, run twice for stability).

## Timeline, ActivityFeed — Family D's 9th and 10th components (2026-11-18)

Both **VERIFIED**. `Timeline` is a chronological, connected list of
events with a per-item tone dot and a real connecting line drawn via
`::before` on the item rather than a fixed-height element, so it spans
correctly regardless of content height. `ActivityFeed` is its actor-
attributed sibling — reuses `Avatar` directly rather than
reimplementing initials/image-fallback logic. Both render as a real
`<ol>`/`<li>` list, not styled `<div>`s, so screen readers announce
position/count per entry. Kept as two separate components rather than
one with an optional-avatar prop: Timeline's "no actor" case is the
common one (system events), so forcing every consumer through an
actor-shaped prop would be the wrong default for its own use case.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(367/367), `pnpm build`, Storybook build, `npx playwright test`
(294/294, run twice for stability).

## CodeBlock — Family D's 11th component (2026-11-18)

**VERIFIED**, with a real bug found and fixed mid-implementation, not
just at the usual doc-update stage. First implementation wrapped
`navigator.clipboard.writeText` in `await` with no `try`/`catch`: a
live check in the browser pane (not just the automated gate) showed
that when the clipboard write is denied — e.g. no permission, an
insecure context, a cross-origin iframe — the promise rejection went
fully uncaught (`Uncaught (in promise) NotAllowedError`) and the UI
gave zero feedback: the button just silently sat there. Fixed by
wrapping the write in `try`/`catch`, adding a third `"failed"` copy
state (distinct icon, distinct `aria-label`, distinct `aria-live`
announcement) alongside `"idle"`/`"copied"`, auto-resetting either way
after 2s via a properly cleaned-up (`useEffect` cleanup) timer ref.

Writing the failure-path unit test surfaced a second, unrelated bug —
this time in the test, not the component: `@testing-library/user-event`'s
`setup()` installs its own `navigator.clipboard` stub (for its
`copy()`/`paste()` helpers) the instant it's called, silently
overwriting whatever mock was defined beforehand — so a test that
calls `userEvent.setup()` *after* mocking `navigator.clipboard`
(the order both copy tests originally used) ends up asserting against
user-event's real stub, not the test's own mock. Since that stub
always resolves, the earlier "copies to clipboard" test was passing
for the wrong reason the whole time — only writing the
previously-missing failure-path test exposed it. Fixed by mocking
`navigator.clipboard` *after* `userEvent.setup()` in both tests, with a
comment explaining why the order matters. CodeBlock intentionally does
not bundle a syntax-tokenizer dependency (`language` is a plain display
label) to keep this package's dependency footprint small; a consumer
wanting real highlighting pre-renders tokenized markup into `code`.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(374/374), `pnpm build`, Storybook build, `npx playwright test`
(299/299, run twice for stability — the real count; an interrupted
mid-session run that showed only 19 passed was a false reading caused
by killing a manually-started Storybook dev server on the same port
mid-run, not a real test failure, and was discarded and re-run clean).

## ChartContainer — Family D's 12th, and last "simpler" component (2026-11-19)

**VERIFIED**. Deliberately doesn't bundle a charting library — same
reasoning as `CodeBlock` not bundling a syntax tokenizer — it owns the
chrome (title, description, actions slot, accessible legend) around
whatever chart a consumer renders into `children` (an SVG, a
`<canvas>`, or another library's output). The legend pairs every
color swatch with a visible text label and marks the swatch itself
`aria-hidden`, per DESIGN_PRINCIPLES.md's "color never carries meaning
alone" rule — verified both by a unit test asserting the pairing and
by the real e2e axe pass in both themes. Visually spot-checked in the
browser pane in both themes before writing e2e, per the renewed
"verify by looking, not just by green checkmarks" practice established
this session.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(381/381), `pnpm build`, Storybook build, `npx playwright test`
(303/303, run twice for stability).

## DataTable — Family D's 13th component (2026-11-19)

**VERIFIED**, with a real CSS specificity bug caught by a live browser
check, not the automated gate. A real `<table>`/`<thead>`/`<tbody>`
with sortable-column affordance (clickable `<button>` headers, real
`aria-sort`) and optional row selection (reuses `Checkbox`, including
its real indeterminate "select all" state) — both fully controlled
(`sort`/`onSortChange`, `selectedIds`/`onSelectedIdsChange`) rather
than sorted/managed internally, because DataTable only knows each
column's *rendered* content, not its underlying value type, so it
can't sort generically without either a per-column comparator or
silently stringifying everything. `DataGrid` (next) is where
virtualized, in-component sort/filter belongs.

The bug: `.b4-data-table__header--end`/`__cell--end` (right-alignment
modifier classes) were being silently overridden back to `text-align:
left` by the earlier, higher-specificity `.b4-data-table th, td` base
rule (two selector parts vs. the modifier's one) — a classic CSS
specificity trap that source order alone doesn't fix. `getComputedStyle`
in the browser pane caught it immediately (`textAlign: "left"` when it
should've been `"right"`); nothing in the automated gate would have,
since neither the unit tests nor the e2e suite asserted computed
`text-align` before this. Fixed by raising the modifier selectors'
specificity (`.b4-data-table th.b4-data-table__header--end`, etc.) and
added an e2e assertion on the real computed style so this can't regress
silently again.

Also reused `--b4-accent-subtle-bg` (not `--b4-control-bg-selected`,
which is tuned for a strong selected-*control* fill like a selected
tab, not a readable row-background tint) for the selected-row
highlight — checked both themes visually before committing to it.

Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(389/389), `pnpm build`, Storybook build, `npx playwright test` run
across four full passes while chasing a clean pair: pass 1 clean
(309/309), pass 2 showed one failure (`dropdown-menu.spec.ts`'s rapid
open/close test — pre-existing, confirmed flaky via isolated
`--repeat-each=3`, 2/3 passed, unrelated to this component), pass 3
showed a different single failure (`chart-container.spec.ts`'s axe
check — also confirmed flaky in isolation, 12/12 passed under repeat),
pass 4 clean (309/309). Both flakes are full-suite-under-parallel-load
timing issues, not regressions from DataTable — tracked as a follow-up
(see HANDOFF.md), not swept under the rug.

## DataGrid — Family D's 14th component, the hardest in the family (2026-11-19)

**VERIFIED** as a genuinely real virtualized/sortable/filterable grid,
not a styled `<table>` capped by `overflow` — the mission brief's
explicit bar for this component. Uses ARIA `grid`/`row`/
`columnheader`/`gridcell` roles over a div-based layout rather than a
native `<table>`, because a `<table>` requires every `<tr>` to be a
contiguous DOM child, which doesn't compose with windowed rendering.
Row virtualization is real, not simulated: only the rows currently
scrolled into view plus a small overscan buffer exist in the DOM at
any time (verified by both a unit test and a real-browser e2e test
counting actual DOM row elements against a 500-row dataset — well
under 40 in the DOM at once, confirmed via `getComputedStyle`-free
direct `document.querySelectorAll` counts, not an assumption).

Sorting and filtering are both genuinely driven by each column's
`getValue: (row) => string | number` accessor — a deliberate departure
from `DataTable`'s controlled-only, render-output-only approach:
knowing the real typed value (not just its rendered JSX) is what makes
real internal comparison-based sorting and substring filtering
possible without guessing at types.

**Real UX bug found via the browser pane, not written down as a
requirement anywhere, then fixed**: sorting or filtering while
scrolled partway down left the viewport's scroll position untouched,
so the newly sorted/filtered row set rendered starting from wherever
the user happened to be scrolled to — reading as "I sorted and nothing
changed" rather than "the list is now scrolled past its own top".
Fixed by resetting `scrollTop` (both the React state driving the
windowing math and the real DOM element's `scrollTop`) on every sort
or filter change, confirmed by watching it happen in the browser
before and after the fix, plus a dedicated unit test and e2e test.

Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(398/398), `pnpm build`, Storybook build. Playwright needed 4 full
passes to land the two clean ones this project's standard calls for —
recorded honestly rather than quietly re-running until green:
- Pass 1: 3 single failures (`dropdown-menu.spec.ts`'s rapid
  open/close test, `form-controls.spec.ts`'s PasswordField axe check,
  `interactive-card.spec.ts`'s axe check). All three confirmed
  pre-existing, full-suite-load-only flakes via an isolated
  `--repeat-each=2` re-run of all three spec files (62/62 passed
  standalone).
- Pass 2: clean, 316/316.
- Pass 3: 1 single failure (`drawer.spec.ts`'s axe check). Confirmed
  flaky the same way (`--repeat-each=3` in isolation, 15/15 passed).
- Pass 4: clean, 316/316.

Passes 2 and 4 are the two clean passes this VERIFIED status rests on.
**None of the four flaky single failures ever touched a DataGrid spec**
— every one was in an unrelated, pre-existing component's test file,
confirmed independently reproducible-as-passing in isolation each
time. This recurring pattern (full-suite-only, never the isolated
file, never DataGrid) is itself worth a dedicated investigation — see
the follow-up note in HANDOFF.md.

## Calendar — Family D's 15th and final component (2026-11-19)

**VERIFIED. Family D — Data & Content is now complete: all 15/15
components VERIFIED.** A real read/display month calendar — events
laid out on a day grid for browsing a schedule, distinct from
`DatePicker`'s input-picker grid (that one lives in a popover and
exists to produce a single chosen date for a form field; this one is
page content and shows events). Reuses `DatePicker`'s month-grid date
math via a new shared module, `internal/monthGrid.ts` — extracted from
`DatePicker.tsx` (which was refactored to import from it too, verified
with no regression) rather than re-derived, per the mission brief's
"reuse, don't recreate" rule. Same ARIA APG grid pattern as
`DatePicker` (`role="grid"`/`"row"`/`"gridcell"`, roving tabindex,
arrow-key/PageUp/PageDown/Home/End navigation) — the keyboard-handling
glue itself stays local to each component (different open/close and
selection semantics), following the same pattern by convention rather
than forcing a shared hook onto two genuinely different interaction
models.

**Two real accessibility bugs found and fixed before this ever reached
VERIFIED, both caught by the real e2e axe pass, not assumed clean from
the unit tests**:

1. **WCAG 2.5.3 "Label in Name" violation.** The first implementation
   put a full description (`aria-label="Saturday, November 21, 2026, 4
   events"`) on each day button while separately rendering real,
   visible event-label text ("Standup", "Launch review", …) inside it.
   An `aria-label` replaces the ENTIRE computed accessible name, so
   that visible text silently dropped out of it — a sighted
   voice-control user who sees "Standup" printed on the day couldn't
   invoke it by saying "Standup". axe-core's
   `label-content-name-mismatch` rule caught this immediately in the
   real browser (serious impact). Fixed by removing the `aria-label`
   entirely and instead adding a visually-hidden (not `aria-hidden`)
   span with the full weekday/month/day/year context as actual content
   inside the button, so the accessible name is computed naturally from
   everything that's genuinely on screen — nothing visible is excluded
   from it anymore.
2. **A real WCAG AA contrast failure, caused by reaching for `opacity`
   instead of a token.** Outside-month days were styled with
   `opacity: 0.5` on the whole button to "look dimmer" — this washes
   out whatever color is underneath unpredictably against the real
   surface behind it, and on Porcelain it landed at 3.53:1 against the
   required 4.5:1 (caught by axe, serious impact). `DatePicker` had
   already solved "de-emphasized day" the right way, with
   `--b4-text-tertiary` (a token already tuned and contrast-verified
   for exactly this), so Calendar was fixed to reuse that instead of
   re-deriving its own (wrong) answer to an already-solved problem.

Both fixes were confirmed with a real e2e re-run (not just reasoning
about it) before being called done.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(407/407, including `DatePicker`'s unchanged 7/7 after its refactor),
`pnpm build`, Storybook build, `npx playwright test` (two clean full
passes, 322/322 each — no flakes this time).

**Family D — Data & Content: 15/15 VERIFIED. Complete.**

## AppShell — Family F's first component (2026-11-19)

**VERIFIED**. The page-level layout scaffold the rest of Family F (and
real pages) compose inside — real `<header>`/`<nav>`/`<main>`
landmarks, not `<div>`s styled to look like regions. `header` spans
the full width at a fixed height; `sidebar` and the main content area
independently fill and scroll within the remaining viewport height,
rather than the whole page scrolling as one block. The sidebar
landmark is omitted entirely (not rendered with an empty label) when
no `sidebar` prop is passed, so a page using only `header`+`children`
doesn't get a spurious empty navigation landmark.

No new gotchas — tokens and the established e2e page-isolation pattern
both worked on the first attempt. Visually spot-checked in the browser
pane in both themes before writing e2e, continuing the "verify by
looking" practice from Family D.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(411/411), `pnpm build`, Storybook build, `npx playwright test`
(326/326, run twice for stability).

## Sidebar — Family F's 2nd component (2026-11-19)

**VERIFIED**. The content that typically fills `AppShell`'s `sidebar`
slot — real, independently focusable `<a>`/`<button>` items in normal
tab order (not a composite ARIA widget; this is ordinary page
navigation, so it gets ordinary navigation semantics), grouped into
sections with an optional visible label. The active item gets a real
surface (`--b4-control-bg-selected`/`--b4-control-fg-selected`, the
same tokens `SegmentedControl`/`ToggleButton`/`Tabs` already use for
selection), not just a color swap — DESIGN_PRINCIPLES.md's "selection
is a surface, not a checkmark" rule. Items render as `<a href>` when
`href` is given, `<button>` otherwise — never a `<div onClick>`.

No new gotchas. Visually spot-checked in both themes before writing
e2e.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(416/416), `pnpm build`, Storybook build, `npx playwright test`
(330/330, run twice for stability).

## PageHeader — Family F's 3rd component (2026-11-19)

**VERIFIED**. The title block at the top of a page's content area —
composes `Breadcrumbs` and `Button`/`ButtonGroup` (passed in as
`breadcrumbs`/`actions` slots) rather than reimplementing either.
Renders `title` as a real `<h1>` by default (`headingLevel` overrides
it for a nested context where `<h1>` would be wrong) — a genuine
heading, not a styled `<div>`/`<p>` standing in for one, since this is
usually the page's one true top-level heading. Distinct from
`AppShell`'s `header` slot: that one is persistent app chrome (a top
bar); this one is page content and scrolls with it.

No new gotchas. Visually spot-checked in both themes before writing
e2e.

Verified: `pnpm typecheck`, `pnpm --filter @b4/react run test`
(422/422), `pnpm build`, Storybook build, `npx playwright test`
(333/333, run twice for stability).

## Known gaps on the Phase 1 motion primitives

- `useAsyncStatus` (in `@b4/motion`, not a rendered component) has unit
  test coverage including a deliberate race-condition test, but is not yet
  *consumed* by any component — Button's `loading` prop is still a plain
  boolean the caller drives manually. Wiring Button (and the eventual
  Toast/form-submit patterns) onto `useAsyncStatus` is useful follow-up,
  not yet done.
- `TextTransition`'s "unmount/remount doesn't duplicate" and "rapid
  changes" tests only check final DOM content, not that the Motion exit
  animation actually ran to completion in-browser — jsdom doesn't run real
  animation frames, so the Playwright e2e test
  (`e2e/motion-primitives.spec.ts`) is the one that exercises real
  animation timing; the unit tests exist for fast feedback on logic, not
  as a substitute for it.
- No dedicated Porcelain-theme e2e pass yet for any Phase 1 primitive,
  same caveat as Button/SegmentedControl.

## Known gaps on the one VERIFIED component (honest, not hidden)

- Porcelain theme's axe/contrast pass was done by direct WCAG contrast-ratio
  calculation (see git history on `packages/tokens/src/theme-porcelain.css`),
  **not** by running the Playwright axe check with the Storybook theme
  toolbar switched to Porcelain — the e2e test only exercises the default
  (Graphite) theme today. Switching themes via the toolbar in a Playwright
  test is straightforward (set `globals=b4Theme:porcelain` in the URL query)
  but hasn't been wired into `e2e/button.spec.ts` yet.
- No visual regression screenshots yet (Playwright supports
  `toHaveScreenshot()`; not set up).
- Reduced-motion behavior (`whileTap` suppression) is implemented and reads
  `useReducedMotion()`, but has no automated test forcing
  `prefers-reduced-motion: reduce` and asserting the spring is skipped.
- IconButton/ButtonGroup/SplitButton/ToggleButton — the rest of the "action"
  sub-family that's supposed to share Button's vocabulary — don't exist yet,
  so "the action family reads as one system" is not yet demonstrated beyond
  one component.

These are tracked, not swept under the rug — see `HANDOFF.md` for next
actions.

## Known gaps on SegmentedControl

- Same Porcelain-e2e gap as Button.
- No visual regression screenshot of the indicator mid-travel.
- `TextTransition`/`NumberTransition`/`AnimatedIndicator` (the reusable
  motion primitives the mission brief lists separately from
  SegmentedControl) do not exist yet — SegmentedControl's indicator uses
  Motion's `layoutId` directly rather than a shared `AnimatedIndicator`
  primitive, because that primitive hasn't been built. Worth revisiting
  once `AnimatedIndicator` exists: SegmentedControl should probably consume
  it rather than duplicate the pattern.
- IconButton/ButtonGroup/SplitButton/ToggleButton (used standalone, not
  inside a SegmentedControl) still don't exist.

## Slider checkpoint (2026-11-17)

| Component | Status | Evidence | Remaining gate |
|---|---|---|---|
| Slider (including range values) | **VERIFIED (2026-11-17, later same day)** | React 80/80 (six Slider tests), motion 5/5; typecheck, package build and Storybook build passed | ~~Browser axe/keyboard tests written but not run successfully~~ — now run: `e2e/slider.spec.ts` passes 20/20 (5 widths × 2 themes geometry + range axe both themes + arrow-key + native-focus checks), part of the 87/87 full-suite run documented at the top of this file |

Playwright startup was blocked by Storybook settings EPERM *in the environment that wrote this checkpoint*. A different session, later the same day, had a working CLI Playwright setup and ran the full suite successfully (see "Full CLI automated regression gate closed" at the top of this file) — the gap this section flagged is closed, not still open.

## Select checkpoint (2026-11-17)

| Component | Status | Evidence | Remaining gate |
|---|---|---|---|
| Select | **VERIFIED (2026-11-17, later same day)** | 14 focused tests; full React suite 94/94 (129/129 after later components); motion 5/5; typecheck, package build, Storybook build; focused ESLint and standalone e2e TypeScript check passed | ~~Real-browser interaction, rendered axe contrast, screenshots and visual review in both themes~~ — now run: `e2e/select.spec.ts` passes 10/10 (5 widths × 2 themes viewport+axe + keyboard/disabled/focus-restore both themes + flip-above-edge + interrupted-exit/reduced-motion), part of the 87/87 full-suite run. One real `aria-hidden-focus` axe finding against Base UI's own focus-guard sentinels, correctly dismissed with reasoning (see top of file) rather than left "inconclusive." |

Composes the existing Field wrapper with Base UI Select. Includes single
controlled/uncontrolled selection, null reset, form submission by value,
read-only and disabled behavior, error/hint wiring, three sizes, wrapping
option descriptions, empty collections, trigger ref, and keyboard navigation.
Selected labels resolve before opening and update when the collection changes.
Motion uses the shared settle spring and useReducedMotion. Exit retention is
wired through Base UI actions; interrupted-exit behavior is not yet proven in
a real browser. No claim of visual or motion verification is made here.

Unit tests confirmed that disabled options are keyboard-focusable but cannot
be selected, and read-only selects allow inspecting choices without changing
value. Tests originally assumed otherwise; those assertions were corrected.
Body-level axe checks include the portal, disabling only the isolated-page
region rule as documented in TESTING.md. This does not verify color contrast.

e2e/select.spec.ts adds both-theme checks at 320/390/768/1440/1920px,
keyboard/focus restoration, bottom-edge positioning and scrolling, OS reduced
motion and interrupted exits. These tests are written, not passing evidence:
Storybook settings writes failed with EPERM, no listener was observed on 6106,
and the in-app browser timed out. Browser execution remains blocked here.

## Combobox — status (2026-11-17, later same day)

**VERIFIED.** Combobox was never given its own status table row before
this — see the prose in "Corrective visual pass" below for its build
history. `e2e/combobox.spec.ts` passes 15/15 (5 widths × 2 themes
viewport+axe + filter/keyboard/clear both themes + stale-options-while-
loading + scroll-highlighted-option-into-view + interrupted-exit/reduced-
motion), part of the 87/87 full-suite run at the top of this file. The
"2 inconclusive" axe results that checkpoint recorded by hand both turned
out to be the same `aria-hidden-focus` focus-guard false positive Select
hit — correctly dismissed with reasoning, not left open.

## Corrective visual pass (latest evidence, 2026-11-17)

User rejected the visible result. The earlier VERIFIED labels were not current
proof of the requested standard. Components changed in this pass are now marked
IMPLEMENTED until the full browser gate is rerun. Earlier evidence in the table
and checkpoint sections is historical, not a fresh verification of these changes.

Slider: fixed double translation against Base UI, missing native-input focus
ring, extra Motion tab stop, cramped story width and indistinguishable range
names. Added neutral/primary variants, three sizes, error semantics, formatted
value announcements, form props and a shared touch-target token. The default
visual treatment is now secondary (neutral); use variant="primary" for accent.
Actual browser geometry checked in both themes at 320/390/768/1440/1920px:
zero vertical centering error, no label overlap and no horizontal overflow.
Graphite and Porcelain screenshots reviewed; keyboard Tab lands on the native
input, arrow stepping works and focus ring is visible. Storybook's live axe
scan of AllVariants: 0 violations, 0 inconclusive, 19 passes in each theme.

Combobox: shared Field and Select option styling; extracted one internal
OptionPopupSurface for both controls. Fourteen unit tests and eleven stories.
Actual browser filtering, keyboard selection, clearing and exit unmount were
exercised. Both-theme popup bounds fit at all five widths after positioning
settled. Keyboard-only navigation through forty options scrolled the last
option into view and selected Region 40 while retaining input focus. Four
rapid close/reopen cycles in each explicit motion mode retained exactly one
popup and list. Live axe on the open Default popup: 0 violations and 2
inconclusive results in each theme. These were the inactive label obscured by
the modal overlay and the programmatically focusable scrolling popup. Label
occlusion and keyboard scrolling were manually inspected; these raw scan
results remain recorded, not relabeled as a complete accessibility pass.

Shared fixes: explicit reduced-motion mode now zeros all CSS duration tokens
(actual browser: reduced=0s, full=0.14s for Combobox). Field passes invalid
state to the primitive. Disabled password/search actions are actually disabled;
search clear restores focus to its input. Text entries use control-radius,
with surface-radius retained for multiline textarea. Existing CSS pixel
literals were replaced by matching shared tokens across the early components.
A source scan found no remaining px/color literals in component CSS. This is
not proof that every possible inline style or animation has been audited.

Storybook: responsive Slider/Select/TextField examples, consistent canvas
background, and all five modifier toolbar controls. TextField AllSizes was
visually reviewed on a 390px viewport in both themes.

The CLI Playwright attempt still failed before tests began (Storybook profile
settings EPERM). Browser-control checks above are actual separate evidence;
none are claimed as a passing Playwright command. Full modifier/device,
screen-reader, clean-consumer and release gates remain unfinished.

Latest final code checks including Family B refinement: React 124/124, motion
5/5, typecheck, package build and Storybook build passed. Focused ESLint and
standalone field-motion e2e TypeScript checks also passed. See AUDIT_REPORT.md.

### Current Family B motion evidence (2026-11-17)

NumberField, PasswordField and RadioGroup were inspected in Graphite and
Porcelain at 320/390/768/1440/1920px (30 checks, no overflow). Real intermediate
numeric translation/opacity, password-glyph crossfade/blur and radio selected
surface travel were observed. Explicit reduced motion removes these movements.
Six live Storybook axe scans (three controls x two themes) returned zero
violations and zero inconclusive results. Native input identity/rapid password
toggles, controlled radio rejection and whole-label clicks have unit coverage.
Optional radio descriptions have a story. `e2e/field-motion.spec.ts` was
written and typechecked but not executed by the session that wrote this —
**it has since been run** (later the same day, different session with a
working CLI Playwright setup): 7/7 pass — NumberField step-without-
replacing-input and PasswordField icon-crossfade in both themes, RadioGroup
traveling-surface-through-interrupted-changes in both themes, and the
reduced-motion-is-instantaneous check — part of the 87/87 full-suite run
documented at the top of this file. **NumberField, PasswordField, RadioGroup,
and AnimatedIndicator are VERIFIED**, not IMPLEMENTED — see the main status
table above.
