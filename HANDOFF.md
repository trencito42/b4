# HANDOFF — read this first on any resume

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

## Next action: Family B's last 4, then continue Family C

Family B still needs `DatePicker`, `TimePicker`, `ColorPicker`,
`FileUpload` — these are the most complex remaining Family B items
(calendar grid logic, color space math, drag-and-drop) and deserve real
scrutiny against "don't fake complex functionality," not a quick stub.
Family C has 16 more components beyond `DropdownMenu` (Tabs, Accordion,
Dialog, Popover, Tooltip, ContextMenu, etc.) — check `@base-ui/react`'s
export list for each one, the way this session did for `select`/
`combobox`/`slider`/`number-field`/`menu`, before building from scratch;
Base UI covers most of Family C, likely including `tabs`, `accordion`,
`dialog`, `popover`, `tooltip` directly. Keep using the shared `Field`
wrapper, `AnimatedIndicator`, `TextTransition`/`NumberTransition`,
`DropdownMenu`, and the internal helpers (`FieldControl`,
`SteppingInput`, `motionCompatibleProps`, `OptionPopupSurface`,
`createItems` — check `packages/react/src/internal/` before building
something that duplicates one of these). Full gate (typecheck → unit
tests → build → Storybook build → Playwright, both themes) before
marking anything VERIFIED, same as every component above. **When a
Storybook-driven e2e interaction mysteriously no-ops, check for an
uncaught exception from a missing required story prop before suspecting
the component** — see the SplitButton bug above.

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

## Known gaps to eventually close (not blockers, just don't forget)

- No CI workflow yet (`RELEASE_CHECKLIST.md`).
- No visual regression testing yet.
- The Porcelain-theme axe check for Button only exists as a manual WCAG
  calculation, not a Playwright run with the theme toolbar switched —
  see `QUALITY_MATRIX.md`'s "known gaps."
- `apps/studio`'s Vite app shell is a one-screen placeholder, not the real
  B4 Studio (nav, category browser, configurator, 3 integration
  showcases) — that's explicitly Phase 6, not a Phase 0 shortfall.


## Git checkpoint

User committed and pushed the preceding Slider batch: local main and
origin/main both point to cae1a5c (Phase 2: Slider checkpoint). Working tree
was clean at the start of Select work. Direct remote verification was blocked
by DNS. Earlier Git writes failed because .git is read-only in this session.
New Select work is local until a new commit succeeds; never imply it was pushed.

Select commit/push attempt also failed at git add: cannot create .git/index.lock
(Permission denied). No Select commit was created; all changes remain local.

Final checkpoint evidence: React 119/119, motion 5/5, typecheck, package and
Storybook builds passed. Focused ESLint and e2e TypeScript checks passed.
Slider/Select/Combobox public imports and server rendering from the Studio
consumer passed. No clean external-install check is claimed. git add failed
again on .git/index.lock (Permission denied), so all corrections, Select and
Combobox remain local. User authorization to commit/push already exists.
