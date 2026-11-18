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

## Next action: Family E's remaining 3 (ExpandingAction, TransitionGroup, LoadingOverlay), then Families D/F

Family E is already 3/11 (`TextTransition`/`NumberTransition`/
`AnimatedIndicator` from Phase 1) — natural next stop, since `Toast`/
`InlineAlert`/`NotificationPanel`/`Spinner` are comparatively
self-contained and `Spinner` in particular can likely extract from
`Button`'s existing inline spinner rather than building one from
scratch (check `Button.tsx`'s `loading` state implementation first).
`MorphingSurface`/`ExpandingAction`/`TransitionGroup`/`LoadingOverlay`
are motion-primitive-flavored — lean on `@b4/motion`'s springs/
durations and `useReducedMotion()`, same as every component above.

Family D (`Card`, `InteractiveCard`, `DataTable`, `DataGrid`,
`Progress`, `CircularProgress`, `Stat`, `Timeline`, `ActivityFeed`,
`Calendar`, `CodeBlock`, `EmptyState`, `ErrorState`, `Skeleton`,
`ChartContainer`) is all PLANNED — `DataGrid` is explicitly called out
in the mission brief as needing to be a **real** virtualized/sortable/
filterable grid, not a styled `<table>`; treat it with the same
scrutiny Family B's DatePicker/ColorPicker/FileUpload got (no Base UI
primitive, real interaction, real tests) rather than the lighter touch
a `Card`/`Stat`/`Skeleton` can get away with. `Calendar` here is
presumably a read/display calendar (events/activity view), distinct
from `DatePicker`'s input-picker grid — confirm the distinction before
building, and reuse `DatePicker`'s month-grid math (`buildMonthGrid`/
`addMonths`/`addDays` in `DatePicker.tsx`) rather than re-deriving it
if the two turn out to need the same date arithmetic.

Family F (`AppShell`, `Sidebar`, `PageHeader`, `Toolbar`, `FilterBar`,
`InspectorPanel`, `ResizablePanels`, `ResourceMeter`, `FileExplorer`,
`QueryEditor`) is all PLANNED and explicitly the most "layout
composition of other components" family — build it last, since it's
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
