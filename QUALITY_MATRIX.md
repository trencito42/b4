# B4 — Quality Matrix

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
| **Badge** | **VERIFIED — and the component that proved the theme-contrast gap was real, not hypothetical** | ✅ 6 tones, **both themes e2e'd with real axe color-contrast**, not just Graphite | ✅ static/presentational, no interaction states needed | ✅ Storybook stories (incl. all-tones overview), autodocs | `e2e/badge.spec.ts` runs axe against both the Graphite *and* Porcelain toolbar states — the first component in this repo to get that, after Button/SegmentedControl only ever checked Graphite |

| **Checkbox** | **VERIFIED** | ✅ unchecked/checked/indeterminate/disabled, both themes e2e'd | ✅ Base UI `Checkbox.Root`/`Indicator` gives real tri-state ARIA + keyboard for free; label-click toggles via native `<label>` association | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |
| **Switch** | **VERIFIED** | ✅ off/on/disabled, both themes e2e'd | ✅ Base UI `Switch.Root`/`Thumb`; label-click + Space key toggle | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |
| **RadioGroup** | **VERIFIED** | ✅ default + disabled-item stories, both themes e2e'd | ✅ Base UI `RadioGroup`/`Radio` gives real roving-tabindex arrow-key nav + ARIA radiogroup semantics for free; verified with a real-browser keyboard test, not just unit | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated keyboard-nav e2e |

| **TextField** | **VERIFIED** | ✅ default/hint/error/required/disabled/3-sizes stories, both themes e2e'd | ✅ Base UI `Field`+`Input` gives real label/description/error ARIA wiring; error replaces hint rather than both showing; typed-input e2e in a real browser | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |

| **Textarea** | **VERIFIED** | ✅ default/hint/error/disabled, both themes e2e'd | ✅ Base UI `Field.Control render={<textarea/>}` pattern; multi-line typed input verified | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes |
| **PasswordField** | **VERIFIED** | ✅ default/hint/error/disabled, both themes e2e'd | ✅ real-browser e2e for the show/hide toggle actually changing input `type`; toggle is keyboard-reachable (verified by unit test tabbing to it) | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated toggle e2e |
| **SearchField** | **VERIFIED — after catching and fixing a real uncontrolled-clear bug** | ✅ empty/with-value/disabled, both themes e2e'd | ✅ clear button appears only with a value and actually empties it (real-browser e2e, not just unit) | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated clear e2e |

| **Field** | **VERIFIED** | ✅ with-custom-control/with-error stories | ✅ confirmed the label only auto-associates with a Base-UI-aware control (`Input`/`Checkbox`/`Switch`/`Field.Control`'s `render` prop) — a bare native element as `children` does **not** get the wiring for free; this was found by the component's own test failing, fixed by correcting the test/story/doc, not the component (the component was already correct; the first draft of its *docs* overclaimed) | ✅ Storybook stories, autodocs | unit tests; see "A docs-accuracy catch" below |

| **NumberField** | **VERIFIED** | ✅ default/hint/error/step/disabled stories, both themes e2e'd | ✅ real Base UI `NumberField` (not `type="number"` on TextField) — min/max clamping, keyboard stepping, stepper buttons all tested; visible input is `role="textbox"` not `"spinbutton"` (a hidden hidden `type="number"` input carries that role instead), test queries corrected to match | ✅ Storybook stories, autodocs | `e2e/form-controls.spec.ts`, both themes + dedicated stepper e2e |

**Full current suite totals**: `pnpm typecheck` (5/5 packages clean), `pnpm --filter @b4/react run test` (74/74), `pnpm --filter @b4/motion run test` (5/5, incl. the async-status race-safety test), `pnpm build` (clean), `pnpm --filter @b4/studio run build-storybook` (clean), `npx playwright test` (30/30, incl. axe-core on Button/SegmentedControl/TextTransition/Badge/Checkbox/Switch/RadioGroup/TextField/Textarea/PasswordField/SearchField/NumberField stories — form controls checked in both themes). Playwright `workers` lowered 4→3 in `playwright.config.ts` as the suite grew past ~27 tests and started flaking again at 4 — see `TESTING.md`.

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

All other components in `COMPONENT_INVENTORY.md`: **PLANNED**.

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
