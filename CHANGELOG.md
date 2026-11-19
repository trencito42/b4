# Changelog

B4 has not been published; this tracks real, meaningful repo milestones, not
a per-npm-release history.

## Unreleased

### ResizablePanels added — Family F, 7/10 (2026-11-19)

- Added `ResizablePanels`: a real two-pane split layout, built from
  scratch (no Base UI primitive) on the WAI-ARIA interactive-separator
  pattern. Resizable by pointer drag and keyboard (arrow keys,
  Home/End).
- Verification split across layers: keyboard resize tested directly
  in the unit suite; pointer-drag resize covered by real-browser e2e
  (jsdom has no real layout for `getBoundingClientRect()`).
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (443/443), `pnpm build`, Storybook build, `npx playwright test`
  (348/348, run twice). **VERIFIED**.

### InspectorPanel added — Family F, 6/10 (2026-11-19)

- Added `InspectorPanel`: properties panel for a selected item, real
  `<dl>`/`<dt>`/`<dd>` markup per label/value pair, grouped into
  sections. Typically `ResizablePanels`' right-hand pane.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (437/437), `pnpm build`, Storybook build, `npx playwright test`
  (344/344, run twice). **VERIFIED**.

### FilterBar added — Family F, 5/10 (2026-11-19)

- Added `FilterBar`: a row of filter controls (`Select`/`SearchField`/
  `Combobox` composed as `children`) plus a removable applied-filter
  chip trail, reusing `Badge` for the chip.
- Fixed a sizing bug: `IconButton`'s smallest size (32px) would have
  overflowed a `Badge` chip's ~22px height — replaced with a
  chip-scaled bare button instead.
- Fixed a real `aria-required-children` violation: "Clear all" was a
  direct child of `role="list"` alongside the `role="listitem"` chips
  — moved it outside the list as a sibling.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (432/432), `pnpm build`, Storybook build, `npx playwright test`
  (341/341, run twice). **VERIFIED**.

### Toolbar added — Family F, 4/10 (2026-11-19)

- Added `Toolbar`/`ToolbarGroup`/`ToolbarSeparator`/`ToolbarButton`/
  `ToolbarIconButton`: a real ARIA toolbar on Base UI's `Toolbar.Root`
  — genuine roving-tabindex arrow-key navigation between items, not
  Tab-order-only. Items wrap Base UI's `Toolbar.Button` via the
  `render` prop, delegating visuals to `Button`/`IconButton` (same
  pattern `Checkbox` already uses).
- Toolbar item components use plain-HTML prop types rather than
  extending `Button`/`IconButton`'s Motion-flavored ones, to avoid a
  type conflict (Motion's `style: MotionStyle` vs. Base UI's plain
  `style?: CSSProperties`) between the two.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (426/426), `pnpm build`, Storybook build, `npx playwright test`
  (337/337, run twice). **VERIFIED**.

### PageHeader added — Family F, 3/10 (2026-11-19)

- Added `PageHeader`: page content-area title block, composes
  `Breadcrumbs`/`Button`/`ButtonGroup` rather than reimplementing
  them. Renders `title` as a real `<h1>` by default (`headingLevel`
  overridable).
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (422/422), `pnpm build`, Storybook build, `npx playwright test`
  (333/333, run twice). **VERIFIED**.

### Sidebar added — Family F, 2/10 (2026-11-19)

- Added `Sidebar`: content for `AppShell`'s `sidebar` slot — real
  `<a>`/`<button>` items in normal tab order, grouped sections. Active
  item gets a real surface, reusing the same selection tokens
  SegmentedControl/ToggleButton already use.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (416/416), `pnpm build`, Storybook build, `npx playwright test`
  (330/330, run twice). **VERIFIED**.

### AppShell added — Family F started, 1/10 (2026-11-19)

- Added `AppShell`: the page-level layout scaffold — real
  `<header>`/`<nav>`/`<main>` landmarks, independently scrolling
  sidebar/content regions. Sidebar landmark omitted entirely when no
  `sidebar` prop is given.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (411/411), `pnpm build`, Storybook build, `npx playwright test`
  (326/326, run twice). **VERIFIED**.

### Calendar added — Family D complete, 15/15 (2026-11-19)

- Added `Calendar`: a real read/display month calendar with events on
  a day grid, reusing `DatePicker`'s month-grid date math via a new
  shared `internal/monthGrid.ts` module (`DatePicker` refactored to
  use it too, no regression). Same ARIA grid pattern as `DatePicker`.
- Fixed a real WCAG 2.5.3 "label in name" violation found by the e2e
  axe pass: an `aria-label` was silently dropping visible event text
  from the accessible name. Fixed with a visually-hidden context span
  instead, letting the name compute naturally from visible content.
- Fixed a real WCAG AA contrast failure from using `opacity: 0.5` for
  outside-month days instead of `DatePicker`'s already-tuned
  `--b4-text-tertiary` token (3.53:1 vs. the required 4.5:1 on
  Porcelain).
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (407/407), `pnpm build`, Storybook build, `npx playwright test` (2
  clean full passes, 322/322 each). **VERIFIED.**

**Family D — Data & Content is now complete: all 15/15 components
VERIFIED.**

### DataGrid added — Family D, 14/15, hardest component in the family (2026-11-19)

- Added `DataGrid`: a real virtualized/sortable/filterable grid per
  the mission brief's explicit bar, not a styled `<table>` capped by
  overflow. ARIA `grid`/`row`/`columnheader`/`gridcell` roles over a
  div-based layout (native `<table>` doesn't compose with windowed
  rendering). Only visible rows + overscan exist in the DOM — verified
  against 500 rows in both a unit test and a real-browser e2e count.
- Sort and filter are genuinely internal, driven by each column's
  `getValue: (row) => string | number` accessor — unlike `DataTable`,
  which only sees each column's rendered output.
- Fixed a real UX bug found via a live browser check: sorting or
  filtering while scrolled partway down left the scroll position
  untouched, so the new row set rendered starting mid-list. Fixed by
  resetting scroll position on every sort/filter change.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (398/398), `pnpm build`, Storybook build, `npx playwright test` (2
  clean full passes, 316/316 each; see QUALITY_MATRIX.md for the full
  pass-by-pass account of intermittent, unrelated full-suite flakes
  encountered and ruled out along the way). **VERIFIED**.

### DataTable added — Family D, 13/15 (2026-11-19)

- Added `DataTable`: real `<table>` semantics, sortable `<button>`
  column headers with real `aria-sort`, optional row selection reusing
  `Checkbox` (incl. real indeterminate "select all"). Sort and
  selection are both fully controlled, not managed internally.
- Fixed a real CSS specificity bug found via a live browser check: the
  `--end` right-align modifier classes were silently losing to a
  higher-specificity base rule and staying left-aligned. Fixed and
  added an e2e assertion on the real computed `text-align`.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (389/389), `pnpm build`, Storybook build, `npx playwright test`
  (two clean full passes, 309/309 each; two intermittent single
  failures in between were confirmed pre-existing flakes unrelated to
  this component via isolated repeat runs). **VERIFIED**.

### ChartContainer added — Family D, 12/15 (2026-11-19)

- Added `ChartContainer`: chart chrome — title, description, actions
  slot, accessible legend — around whatever chart a consumer renders
  into `children`. No bundled charting library, same reasoning as
  `CodeBlock` not bundling a syntax tokenizer.
- Legend pairs every color swatch with a visible text label and marks
  the swatch `aria-hidden`, per the "color never carries meaning
  alone" rule.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (381/381), `pnpm build`, Storybook build, `npx playwright test`
  (303/303, run twice). **VERIFIED**.

### CodeBlock added — Family D, 11/15 (2026-11-18)

- Added `CodeBlock`: real copyable code display, `language` label,
  optional line numbers. No bundled syntax tokenizer — `language` is a
  display label only, keeping the package's dependency footprint small.
- Fixed a real bug found via a live browser check: an unhandled
  clipboard-write rejection (e.g. denied permission) left the UI with
  no feedback. Added a `try`/`catch` and a distinct `"failed"` copy
  state with its own icon, `aria-label`, and `aria-live` announcement.
- Fixed a test-only bug the failure-path test exposed:
  `userEvent.setup()` installs its own `navigator.clipboard` stub,
  silently overriding a mock set up before it — the original
  success-path test had been passing against that stub, not the
  intended mock. Fixed by mocking clipboard after `userEvent.setup()`.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (374/374), `pnpm build`, Storybook build, `npx playwright test`
  (299/299, run twice). **VERIFIED**.

### Timeline, ActivityFeed added — Family D, 10/15 (2026-11-18)

- Added `Timeline`: chronological connected list with a per-item tone
  dot and a real `<ol>`/`<li>` structure.
- Added `ActivityFeed`: its actor-attributed sibling, reusing `Avatar`
  directly for the actor image/initials.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (367/367), `pnpm build`, Storybook build, `npx playwright test`
  (294/294, run twice). **Both VERIFIED**.

### Stat, EmptyState, ErrorState added — Family D, 8/15 (2026-11-18)

- Added `Stat`: labeled metric with an optional `up`/`down`/`neutral`
  trend delta, reusing `--b4-success`/`--b4-danger-text` directly for
  the trend text color (no new tokens needed).
- Added `EmptyState` and `ErrorState`: share an "icon + title +
  description + optional action" shape but stay separate components —
  `ErrorState` is `role="alert"`, `EmptyState` is not (a real semantic
  difference, not just a color swap).
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (359/359), `pnpm build`, Storybook build, `npx playwright test`
  (288/288, run twice). **All three VERIFIED**.

### Card, InteractiveCard added — Family D, 5/15 (2026-11-18)

- Added `Card`: static content surface, `flat`/`raised`/`outlined`
  variants, reuses `--b4-surface-radius`/`--b4-shadow-raised` (no new
  tokens needed).
- Added `InteractiveCard`: clickable sibling, a real `<button>` sharing
  `Button`'s press spring plus a hover lift, both skipped under
  `useReducedMotion()`.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (343/343), `pnpm build`, Storybook build, `npx playwright test`
  (279/279, run twice). **Both VERIFIED**.

### Skeleton added — Family D, 3/15 (2026-11-18)

- Added `Skeleton`: `aria-hidden` loading placeholder, `text`/
  `circle`/`rect` variants, gradient shimmer sweep. Purely decorative —
  `prefers-reduced-motion` drops the animation entirely rather than
  slowing it.
- Found and fixed a jsdom quirk: `toHaveStyle({ height: "2rem" })`
  failed because jsdom resolves relative units against its own 16px
  default root font-size when reading computed style, not the raw
  inline value; fixed by asserting `el.style.height` directly.
- Full gate: `pnpm typecheck`, `pnpm --filter @b4/react run test`
  (334/334), `pnpm build`, Storybook build, `npx playwright test`
  (272/272, run twice). **VERIFIED**.

### Progress, CircularProgress added — Family D started, 2/15 (2026-11-18)

- Added `Progress`/`CircularProgress`: real Base UI `Progress`
  primitives. `CircularProgress` renders a genuine SVG
  `stroke-dashoffset` ring (not a `conic-gradient` approximation),
  confirmed with a real e2e `stroke-dashoffset` comparison.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (329/329), `pnpm build`, Storybook build, `npx playwright test`
  (268/268, run twice). **VERIFIED**.

### LoadingOverlay added — Family E complete, all 11/11 (2026-11-18)

- Added `LoadingOverlay`: a real blocking overlay (`pointer-events:
  auto` genuinely intercepts clicks on covered content), reusing
  `Spinner` directly. Proven with a real e2e test using a
  `window.alert()` + Playwright's `dialog` event, not assumed.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (316/316), `pnpm build`, Storybook build, `npx playwright test`
  (254/254, run twice). **VERIFIED**.

**Family E — Feedback & Motion is complete: all 11 components
VERIFIED.**

### TransitionGroup added — Family E at 10/11 (2026-11-18)

- Added `TransitionGroup`: a real enter/exit list via Motion's
  `AnimatePresence` (`mode="popLayout"`), auto-wrapping a normal keyed
  list of children.
- Found and fixed a real e2e test bug: a bare `page.locator("li")`
  also matched Storybook's own always-present, invisible preview-
  iframe error-boundary markup. Fixed by scoping to the demo's own
  item class.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (310/310), `pnpm build`, Storybook build, `npx playwright test`
  (250/250, run twice). **VERIFIED**.

### ExpandingAction added — Family E at 9/11 (2026-11-18)

- Added `ExpandingAction`: a compact icon action that genuinely widens
  on hover/focus via real `layout`-driven animation, confirmed with a
  real e2e `boundingBox()` width comparison.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (306/306), `pnpm build`, Storybook build, `npx playwright test`
  (246/246, run twice). **VERIFIED**.

### MorphingSurface added — Family E at 8/11 (2026-11-18)

- Added `MorphingSurface`: a real FLIP-based morph via Motion's
  `layout`/`layoutId`, the general-purpose counterpart to
  `AnimatedIndicator` — confirmed with a real e2e `boundingBox()` width
  comparison before/after, not just a text-content check.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (299/299), `pnpm build`, Storybook build, `npx playwright test`
  (241/241, run twice). **VERIFIED**.

### NotificationPanel added — Family E at 7/11 (2026-11-18)

- Added `NotificationPanel`: a persistent notification list in a
  popover, built on the existing `Popover`. Unread state uses a dot +
  bolder text + a visually-hidden "(unread)" announcement, never color
  alone.
- Found and fixed a real test bug: passing a wrapper component instead
  of the actual element to `Popover`'s `trigger` prop silently breaks
  every click, since cloning props onto a component doesn't forward
  them to what it renders.
- Fixed the same `--b4-text-disabled`-on-non-disabled-text mistake
  (4th occurrence this session) on the item timestamps.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (295/295), `pnpm build`, Storybook build, `npx playwright test`
  (237/237, run twice). **VERIFIED**.

### InlineAlert added — Family E at 6/11 (2026-11-18)

- Added `InlineAlert`: a persistent page-level message (distinct from
  `Toast`), four tones each with a distinct icon glyph, reusing
  `Badge.css`'s tone-token triad. Optional dismissible with a real
  close button.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (289/289), `pnpm build`, Storybook build, `npx playwright test`
  (231/231, run twice). **VERIFIED**.

### Toast added — Family E at 5/11 (2026-11-18)

- Added `Toast`: a real Base UI `Toast` system (`ToastProvider` +
  `useToast()`), with genuine swipe-to-dismiss, priority levels, and a
  `promise()` helper for loading → success/error flows.
- **Fixed a real, pre-existing accessibility bug, live since Phase 0**:
  Graphite theme's `--b4-accent-hover` gave Button/IconButton's
  `:hover` state only 2.92:1 contrast against white text (needs
  4.5:1), caught by an e2e axe scan that happens to run right after
  clicking a primary Button. Root cause: the hover color shared a
  token (`--b4-accent-400`) with a different, incompatible contrast
  requirement (`--b4-accent-text`, light text on a dark surface).
  Fixed by splitting out a dedicated `--b4-accent-hover-fill` token.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (283/283), `pnpm build`, Storybook build, `npx playwright test`
  (227/227, run twice). **VERIFIED**.

### Spinner added — Family E at 4/11 (2026-11-18)

- Added `Spinner`, the standalone counterpart to `Button`'s own inline
  `loading` spinner, extracted for use outside `Button`.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (277/277), `pnpm build`, Storybook build, `npx playwright test`
  (220/220, run twice). **VERIFIED**.

### FileUpload added — Family B complete, all 19/19 (2026-11-18)

- Added `FileUpload`: a real dropzone (native `<input type="file">`
  over the whole visible area, real `accept`/`maxSizeBytes`/
  `maxFiles` validation, a real file list with removal).
- Found and fixed a real bug via the e2e drag-and-drop test: relying
  on native browser behavior to populate a file input's `.files` on
  drop doesn't work for a scripted drop event (browsers refuse to set
  `.files` from untrusted events). Switched to a real `onDrop` handler
  reading `event.dataTransfer.files` directly — the standard,
  trust-independent mechanism every real uploader uses.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (273/273), `pnpm build`, Storybook build, `npx playwright test`
  (216/216, run twice). **VERIFIED**.

**Family B — Inputs & Forms is complete: all 19 components VERIFIED.**

### ColorPicker added — Family B, third of the last 4 (2026-11-18)

- Added `ColorPicker`: a real draggable + keyboard-operable saturation/
  brightness area, a real Base UI `Slider` reused for hue, a hex text
  field synced both ways, real HSV↔RGB↔hex math — not a swatch
  delegating to `<input type="color">` and not a static gradient image.
- Applied every lesson from DatePicker/TimePicker up front; every unit
  test, the build, and every e2e test (including real pointer drags on
  the area and hue slider) passed on the first run.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (265/265), `pnpm build`, Storybook build, `npx playwright test`
  (209/209, run twice). **VERIFIED**.

### TimePicker added — Family B, second of the last 4 (2026-11-18)

- Added `TimePicker`: two real Base UI `NumberField` instances (hours,
  minutes) plus `SegmentedControl` for AM/PM, reusing
  `NumberField.tsx`'s own internal recipe.
- Found and fixed two real bugs before/during testing: no uncontrolled-
  mode `useState` fallback (a `defaultValue`-only instance would never
  update from interaction); and an ambient `aria-labelledby` from the
  surrounding `Field.Root` context overriding each segment's own
  `aria-label`, giving both segments the same computed accessible name.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (257/257), `pnpm build`, Storybook build, `npx playwright test`
  (202/202, run twice). **VERIFIED**.

### DatePicker added — Family B, first of the last 4 (2026-11-18)

- Added `DatePicker`: a real ARIA APG "Date Picker Dialog" grid
  (full arrow-key/PageUp/PageDown/Home/End keyboard navigation, roving
  tabindex, min/max range enforcement) wrapped in the existing
  `Popover` component.
- Found and fixed three real bugs: a cross-month focus move needed a
  `useEffect` instead of a synchronous call or `requestAnimationFrame`;
  a real `color-contrast` violation on adjacent-month days (fully
  clickable, not disabled, so the disabled-text token was wrong); a
  missing accessible name on the popover dialog.
- Scope, logged honestly: weeks start on Sunday, no Shift+PageUp/
  PageDown year jump.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (249/249), `pnpm build`, Storybook build, `npx playwright test`
  (195/195, run twice). **VERIFIED**.

### TreeView added — Family C complete, 17/17 (2026-11-18)

- Added `TreeView`: real `tree`/`treeitem`/`group` ARIA roles, nested
  `<ul role="group">` subtrees, roving tabindex, full ARIA APG
  keyboard pattern. Built entirely from scratch — no Base UI primitive
  exists for trees.
- Found and fixed three real bugs via real-Chromium traces: keydown
  bubbling through every ancestor row after a subtree expands
  (fixed with an `event.currentTarget !== event.target` guard); an
  invalid `aria-hidden` + focusable combination on the disclosure
  control that also broke Playwright's role queries (changed to a
  non-focusable `<span>`); a named descendant folding its own
  `aria-label` into the ancestor's accessible name (confirmed via a
  real accessibility snapshot, fixed by removing the extra naming
  altogether rather than adding more overrides).
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (242/242), `pnpm build`, Storybook build, `npx playwright test`
  (189/189, run twice). **VERIFIED**.

**Family C — Navigation & Overlays is complete: 17/17 VERIFIED.**

### CommandPalette added — Family C at 16/17 (2026-11-18)

- Added `CommandPalette`: a real Base UI `Dialog` wrapping a real Base
  UI `Combobox` in its documented `inline` mode.
- Found and fixed a real bug: the first draft called
  `preventUnmountOnClose()` without wiring `actionsRef`/`unmount()`,
  leaving the popup permanently stuck mounted after every close.
  Confirmed via a real Chromium run, fixed by completing the pattern
  `Dialog.tsx`/`AlertDialog.tsx` already use correctly.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (235/235), `pnpm build`, Storybook build, `npx playwright test`
  (183/183, run twice). **VERIFIED**.

### Sheet added — Family C at 15/17 (2026-11-18)

- Added `Sheet`, `Drawer`'s bottom-anchored sibling: shares the same
  Base UI `drawer` primitive and CSS, with `swipeDirection="down"` and
  its own positioning/grabber handle.
- Applied Drawer's lessons up front; first run clean.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (229/229), `pnpm build`, Storybook build, `npx playwright test`
  (178/178, run twice). **VERIFIED**.

### Drawer added — Family C at 14/17 (2026-11-18)

- Added `Drawer`, built on Base UI's own `drawer` primitive: a
  right-edge side panel with real swipe-to-dismiss (not a mockup).
- Found that the `actionsRef`/`preventUnmountOnClose` pattern used by
  `Dialog`/`AlertDialog`/`ContextMenu` (for coordinating with an
  externally-driven Motion exit animation) is the wrong pattern for a
  CSS-only-transition component — it left the popup stuck mounted after
  close. Removed it in favor of plain `open`/`onOpenChange`.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (224/224), `pnpm build`, Storybook build, `npx playwright test`
  (173/173, run twice). **VERIFIED**.

### NavigationMenu added — Family C at 13/17 (2026-11-18)

- Added `NavigationMenu`, built on Base UI's own `navigation-menu`
  primitive (`Root > List > Item > Trigger + Content`, shared `Portal >
  Positioner > Popup > Viewport`).
- Found and fixed a real e2e test bug (not a component bug): clicking a
  second top-level trigger while the menu is open closes it instead of
  switching, because the cursor hovering over the trigger on the way to
  clicking it already switched the active section (Base UI's documented
  hover-or-click trigger behavior), and the trailing click then closes
  the now-active trigger. Rewrote the test to assert hover-based
  switching and click-to-close instead.
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (219/219), `pnpm build`, Storybook build, `npx playwright test`
  (168/168, run twice). **VERIFIED**.

### Breadcrumbs, Pagination, Stepper added — Family C at 12/17 (2026-11-18)

- Added `Breadcrumbs`, `Pagination`, `Stepper` — the three remaining
  pure-presentational Family C components (no Base UI primitive exists
  for any of them). Registered in `index.ts`/`styles.css`.
- Fixed a real bug before shipping: `Pagination.css`/`Stepper.css`
  first referenced non-existent design tokens (`--b4-accent-solid`,
  `--b4-surface-hover`, `--b4-surface-raised`), which resolve silently
  to nothing rather than erroring. Caught by axe's `color-contrast` rule
  (1.04:1 white-on-white on Porcelain). Fixed to the real tokens
  (`--b4-accent`, `--b4-control-bg-hover`, `--b4-surface-2`).
- Full gate: `pnpm typecheck` (4/4), `pnpm --filter @b4/react run test`
  (216/216), `pnpm --filter @b4/motion run test` (5/5), `pnpm build`,
  Storybook build, `npx playwright test` (162/162, run twice). All three
  now **VERIFIED**.

### Full CLI regression gate closed (2026-11-17, later same day)

- Ran the exact full automated gate an earlier session's environment
  couldn't (`EPERM` starting the Playwright webServer): `pnpm typecheck`
  (5/5), `pnpm --filter @b4/react run test` (129/129), `pnpm --filter
  @b4/motion run test` (5/5), `pnpm build`, Storybook build, `npx
  playwright test` (87/87, run twice for stability). All twenty existing
  components upgraded from IMPLEMENTED to **VERIFIED**.
- Fixed one real finding: `select.spec.ts`/`combobox.spec.ts` axe scans
  failed `aria-hidden-focus` against Base UI's own internal focus-guard
  sentinel elements (deliberately hidden-but-focusable by design, for Tab
  trapping) — disabled that rule with reasoning recorded in both files.
  This resolves the "2 inconclusive" axe results the Combobox checkpoint
  had already flagged by hand.
- Added missing both-theme e2e axe coverage for `IconButton`/
  `ToggleButton` (`e2e/icon-toggle-button.spec.ts`), the only two
  previously-verified components with none.

### ContextMenu, HoverCard — Family C's eighth and ninth components (2026-11-18)

- `@b4/react`: `ContextMenu` (right-click/long-press, reuses
  `DropdownMenu`'s item type and CSS) and `HoverCard` (Base UI's
  `PreviewCard` under the conventional name).
- Found: `ContextMenu.Root` has no `actionsRef`/`preventUnmountOnClose`,
  unlike every other popup component so far — caught by `tsc`.

### AlertDialog — Family C's seventh component (2026-11-18)

- `@b4/react`: `AlertDialog`, for destructive/irreversible confirmations.
  No decorative close button; verified it does not close on outside
  click, unlike `Dialog`. Reuses `Dialog`'s CSS.

### Dialog — Family C's sixth component (2026-11-18)

- `@b4/react`: `Dialog`, a real Base UI `Dialog` (modal, focus trap,
  backdrop, Escape/outside-click-to-close).
- Avoided a real class of bug before shipping: centering via `transform:
  translate(...)` would have collided with Motion's own `scale`
  transform on the same element (the "double transform" issue `Slider`
  had) — used fixed-inset + `margin: auto` centering instead.

### Accordion — Family C's fifth component (2026-11-18)

- `@b4/react`: `Accordion`, built on Base UI's `Accordion`. Confirmed
  per-part data attributes (Trigger's `data-panel-open` differs from
  Item/Panel's `data-open`, within the same component).
- Fixed a test that wrongly assumed arrow-key roving focus between
  triggers — Base UI removed that behavior following an ARIA APG
  update; rewrote the test for the current Tab-order contract.

### Tabs, and TextTransition/NumberTransition motion improvements (2026-11-17)

- `@b4/react`: `Tabs`, built on Base UI's `Tabs` with its own
  `Tabs.Indicator` for the traveling highlight.
- Fixed: selected-tab CSS used the wrong data attribute
  (`[data-selected]` instead of the real `data-active`), leaving
  selected-tab text at the wrong color — a real 1.42:1 contrast failure
  on Porcelain, caught by the Playwright axe scan.
- Fixed: renewed `select.spec.ts` e2e flakiness (axe-scan collision,
  a too-fast keyboard sequence) with the proven settle-wait pattern.
- Improved (user-requested): `TextTransition`'s `crossfade` mode gained
  a subtle scale; `vertical`/`horizontal` modes now use a spring instead
  of a tween; `NumberTransition` now forces tabular-nums digits. No API
  changes.

### Popover — Family C's third component (2026-11-17)

- `@b4/react`: `Popover`, click-triggered, holds real interactive
  content (confirm buttons etc., not static text). Closes on Escape/
  outside click, returns focus to the trigger.

### Tooltip — Family C's second component (2026-11-17)

- `@b4/react`: `Tooltip`, a real Base UI `Tooltip` composition.
  Documented two test-infra gotchas for future popup components:
  disabled buttons can't test focus-triggered behavior, and
  Storybook's `addon-a11y` background scan can race a manual one.

### Family B's last core inputs: MultiSelect, InputGroup (2026-11-17)

- `@b4/react`: `MultiSelect` (shares `Select`'s Base UI Root with
  `multiple`, same pattern as Slider/RangeSlider) and `InputGroup`
  (joins a possibly-interactive addon with an input in one visual box).
  Family B now stands at 15/19 VERIFIED; only DatePicker, TimePicker,
  ColorPicker, FileUpload remain.

### Family A completed; DropdownMenu opens Family C (2026-11-17)

- `@b4/react`: `Link`, `StatusBadge`, `Avatar`, `AvatarGroup`,
  `KeyboardShortcut`, `ButtonGroup` (Family A complete, all 12 VERIFIED),
  `SplitButton`, and `DropdownMenu` (Family C's first component, a real
  Base UI `Menu` composition — SplitButton needed a working menu, not a
  decorative chevron, so this was pulled forward rather than faked).
- Fixed: SplitButton's first story was missing the required `onSelect`
  prop, so clicking a menu item threw and silently blocked the menu's
  own close-on-click behavior. Added a permanent regression test for the
  mouse-click path. Also fixed two test-timing issues in
  `dropdown-menu.spec.ts` (axe sampling mid-fade; a rapid-cycle test
  racing the settle spring under full motion).

- Switch now uses shared spring travel between layout-defined thumb positions,
  including RTL, instead of a physical CSS translateX. Added neutral selection
  surfaces, snap press feedback, control ref and shared hit target. Seven focused
  tests and code/build checks passed; both-theme manual browser evidence is in
  HANDOFF.md. Full current browser regression remains pending.

- Checkbox uses neutral B4 selection surfaces, animated check drawing/mixed
  morph and snap press feedback, with instant reduced-motion changes. Added
  control ref forwarding, shared hit-target sizing, state overview and Select
  all stories. Focused Checkbox tests 9/9 and code/build checks passed; visual
  browser verification of this revision remains pending.

- Field's dropdown stories now reuse B4 Select (including its shared popup
  motion) instead of inline-styled native selects. Existing story links remain
  valid; docs explain that Select already includes Field.

### Family B interaction refinement

- Shared matte input surfaces and animated focus feedback. NumberField now
  animates accepted steps without replacing its editable input; PasswordField
  transitions the visibility glyph using the existing IconButton/TextTransition.
- RadioGroup adds a traveling selected row, animated radio dot and optional
  item descriptions. AnimatedIndicator supports an optional span render target.
- React 124/124 and motion 5/5 tests, typecheck, package and Storybook builds
  passed. Both-theme manual motion/responsive/axe evidence is recorded in
  HANDOFF.md; automated browser regression remains pending.

### Added

- Select (IMPLEMENTED; browser/visual verification pending): shared Field +
  Base UI selection, three sizes, descriptions, controlled values, form
  submission, null reset, read-only/disabled/error/empty states, settle-spring
  popup, 14 unit tests and 10 stories. See QUALITY_MATRIX.md for exact evidence.

- Monorepo scaffold: pnpm workspace with `packages/tokens`, `packages/motion`,
  `packages/react`, `apps/studio`.
- `@b4/tokens`: B4 Graphite (dark) and B4 Porcelain (light) themes as plain
  CSS custom properties, plus the density/radius/contrast/motion modifier
  axes.
- `@b4/motion`: duration/easing/spring token constants and
  `useReducedMotion()`, mirroring the CSS motion tokens for Motion-for-React
  use.
- `@b4/react`: `Button` (primary/secondary/ghost/destructive × sm/md/lg,
  loading/disabled states) — the first component through the full quality
  gate (types, unit tests incl. axe, Storybook stories, Playwright + axe
  e2e).
- `@b4/react`: `SegmentedControl` (the Changelog/Login reference component
  named in the mission brief) — built on Base UI's `ToggleGroup`/`Toggle`
  for real keyboard/ARIA behavior, with a Motion `layoutId` traveling
  capsule indicator. Controlled + uncontrolled. Full quality gate passed,
  including a rapid-alternating-click check proving the indicator never
  duplicates.
- `@b4/react`: `AnimatedIndicator` (the shared traveling-surface primitive,
  extracted from SegmentedControl and now consumed by it), `TextTransition`
  (crossfade/vertical/horizontal replacement modes), `NumberTransition`
  (built on TextTransition, direction auto-derived from increase/decrease).
- `@b4/motion`: `useAsyncStatus` — a race-safe idle/pending/success/error
  async-state hook for the label→spinner→success(/error) pattern.
- `@b4/react`: `IconButton`, `ToggleButton`, `Badge` (Family A). Badge is
  the first component e2e-tested in both Graphite and Porcelain, which
  found 3 more real contrast bugs (see Fixed, below).
- `@b4/react`: `Checkbox`, `Switch`, `RadioGroup` (Family B), built on
  Base UI primitives for real tri-state/keyboard/ARIA behavior. All
  e2e-tested in both themes from the start.
- `@b4/react`: `TextField` (Family B), built on Base UI's `Field` + `Input`
  — the base text-entry pattern for the rest of Family B's text fields.
- `@b4/react`: `Textarea`, `PasswordField`, `SearchField` (Family B),
  extending TextField's pattern.
- `@b4/react`: `Field` (Family B) — the shared label/hint/error wrapper,
  extracted from `TextField`/`Textarea`/`PasswordField`/`SearchField`.
  Also absorbs the brief's separate "FormField" entry (same component).
- `@b4/react`: `NumberField` (Family B), built on Base UI's full
  `NumberField` for real min/max clamping and stepper buttons.
- B4 Studio: Storybook 10 instance (addon-a11y, addon-docs) plus a minimal
  Vite app shell.
- Full docs scaffolding (`ARCHITECTURE.md`, `DESIGN_PRINCIPLES.md`,
  `MOTION_SPEC.md`, `COMPONENT_INVENTORY.md`, `QUALITY_MATRIX.md`,
  `PROGRESS.md`, `TESTING.md`, `RELEASE_CHECKLIST.md`, `AGENTS.md`,
  `GUI.md`, `HANDOFF.md`).

### Fixed (caught by the quality gate, not by eye)

- Graphite theme's destructive-button and primary-button fills had
  insufficient white-text contrast (2.76:1 and 3.98:1) — caught by the
  Playwright + axe-core check, fixed by darkening `--b4-danger` and
  `--b4-accent-500`.
- Porcelain theme's `--b4-success` had insufficient contrast for a
  hypothetical white-on-fill use (future Toast/StatusBadge) — found by
  direct WCAG calculation while auditing the other status colors, fixed
  pre-emptively.
- Graphite's `--b4-accent` used as Badge's accent-tone text measured
  2.68:1 (needs 4.5:1) against its own tint background — fixed by adding
  `--b4-accent-text`. Porcelain's `--b4-danger`/`--b4-info` were
  borderline (4.05–4.48:1) as Badge text on their own tints — fixed by
  darkening `--b4-danger` and tuning both tint percentages. All three
  found by testing Badge in both themes with real axe-core, not by eye or
  hand-calculated contrast math.
- `SearchField`'s clear button updated its own tracking state but never
  actually reset the underlying (uncontrolled) input's value — caught by
  its own unit test, fixed by always passing one fully-computed value to
  the underlying `Input` instead of mixing `value`/`defaultValue`.

### Corrective verification checkpoint

- Fixed Slider's double translation, native-input focus styling and extra
  Motion keyboard stop; added sizes, neutral/accent variants, range labels,
  formatted announcements, error/form support and responsive stories.
- Added Combobox using stable IDs and shared option-surface motion/styles.
- Fixed shared invalid-state semantics, disabled search/password actions,
  focus after search clear, explicit CSS reduced motion and token literals.
- Added modifier toolbars and aligned single-line fields with control-radius.
- Reclassified touched components as IMPLEMENTED until full browser checks
  are rerun. AUDIT_REPORT.md distinguishes real browser evidence from tests
  blocked by the environment; the overall plan remains unfinished.
