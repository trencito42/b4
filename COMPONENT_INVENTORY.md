# B4 — Component Inventory

Status values match `QUALITY_MATRIX.md`: PLANNED / IMPLEMENTING / IMPLEMENTED
/ TESTING / VERIFIED / BLOCKED. This file is the scope contract — components
are not silently dropped; if scope changes, it changes here with a reason.

## Family A — Actions & Identity

| Component | Status |
|---|---|
| Button | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| IconButton | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| ButtonGroup | **VERIFIED** |
| SplitButton | **VERIFIED** |
| ToggleButton | **VERIFIED** |
| ToggleGroup | **VERIFIED** (2026-11-20) — grouped on/off buttons, single or `multiple`; distinct from SegmentedControl, see scope log |
| SegmentedControl | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| Link | **VERIFIED** |
| Badge | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| StatusBadge | **VERIFIED** |
| Avatar | **VERIFIED** |
| AvatarGroup | **VERIFIED** |
| KeyboardShortcut | **VERIFIED** |

## Family B — Forms & Inputs

The November 20 Batch 3 review covers the 18 entries specified for forms
craftsmanship, with `RangeSlider` exercised through `Slider` array values.
The November 20 continuation closed the whole-suite gate with two full
browser passes and the release checks.
[Forms audit](FORMS_CRAFTSMANSHIP.md)
[Quality matrix](QUALITY_MATRIX.md#batch-3--forms-craftsmanship-2026-11-20)

| Component | Status |
|---|---|
| Checkbox | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| Switch | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| RadioGroup | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| TextField | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| Textarea | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| PasswordField | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| SearchField | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| NumberField | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| InputOTP | **VERIFIED** (2026-11-20) — verification-code entry on Base UI `OTPField`; real paste/autofill/numeric-keyboard support, not hand-rolled per-slot inputs |
| TagsInput | **VERIFIED** (2026-11-20) — free-form tag entry on the shared `Field`/`FieldControl` surface; Enter/comma commit, multi-value paste, roving chip focus, IME-safe |
| InputGroup | **VERIFIED** |
| Select | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| Combobox | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| MultiSelect | **VERIFIED** |
| Slider | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| RangeSlider | Covered by Slider array values - **VERIFIED** alongside Slider |
| DatePicker | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| TimePicker | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| ColorPicker | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| FileUpload | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Field | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |

## Family C — Navigation & Overlays

| Component | Status |
|---|---|
| DropdownMenu | **VERIFIED** |
| Tabs | **VERIFIED** |
| Accordion | **VERIFIED** |
| Breadcrumbs | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Pagination | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Stepper | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| NavigationMenu | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| ContextMenu | **VERIFIED** |
| Tooltip | **VERIFIED** |
| Popover | **VERIFIED** |
| HoverCard | **VERIFIED** |
| Dialog | **VERIFIED** |
| AlertDialog | **VERIFIED** |
| Drawer | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Sheet | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| CommandPalette | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| TreeView | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |

## Family D — Data & Content

| Component | Status |
|---|---|
| Progress | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| CircularProgress | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Card | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| InteractiveCard | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| DataTable | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| DataGrid | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| Stat | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Timeline | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| ActivityFeed | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Calendar | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| CodeBlock | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| EmptyState | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| ErrorState | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Skeleton | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| ChartContainer | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |

DataGrid must be a real virtualized/sortable/filterable grid, not a styled
`<table>` — see mission brief's "specialized components" note.

## Family E — Feedback & Motion

| Component | Status |
|---|---|
| TextTransition | **VERIFIED** |
| NumberTransition | **VERIFIED** |
| TextMorph | **VERIFIED** (first-party intelligent text morphing engine with distance-affinity bipartite matching, numeric place values, FLIP spatial continuity, and Studio lab) |
| AnimatedIndicator | **VERIFIED** (incl. span-as-root support added for RadioGroup) |
| Toast | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| InlineAlert | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| NotificationPanel | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| Spinner | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| MorphingSurface | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| ExpandingAction | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| TransitionGroup | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| LoadingOverlay | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |

## Family F — Application Patterns

| Component | Status |
|---|---|
| AppShell | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| Sidebar | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| PageHeader | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| Toolbar | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| FilterBar | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| InspectorPanel | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| ResizablePanels | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| ResourceMeter | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| FileExplorer | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |
| QueryEditor | **VERIFIED** (full CLI regression gate closed 2026-11-19, see QUALITY_MATRIX.md) |

FileExplorer is a real tree (`TreeView`) with folder-first sorting and
file-only open. QueryEditor tokenizes and validates a SQL subset; it is
not a styled textarea.

## Family G — Layout Primitives

| Component | Status |
|---|---|
| Separator | **VERIFIED** — typecheck/build/unit/Storybook/Playwright gate closed 2026-11-19, see QUALITY_MATRIX.md |
| VisuallyHidden | **VERIFIED** — typecheck/build/unit/Storybook/Playwright gate closed 2026-11-19, see QUALITY_MATRIX.md |
| AspectRatio | **VERIFIED** — typecheck/build/unit/Storybook/Playwright gate closed 2026-11-19, see QUALITY_MATRIX.md |
| Collapsible | **VERIFIED** — typecheck/build/unit/Storybook/Playwright gate closed 2026-11-19, see QUALITY_MATRIX.md |
| ScrollArea | **VERIFIED** — typecheck/build/unit/Storybook/Playwright gate closed 2026-11-19, see QUALITY_MATRIX.md |

Added per the mission brief's component-gap audit (batch 2): five
genuinely missing standard primitives, each built on Base UI where Base
UI has the primitive (`Separator`, `Collapsible`, `ScrollArea`) and pure
CSS where it doesn't need more (`AspectRatio`, `VisuallyHidden`). `Stack`/
`Grid`/`Container` were deliberately **not** added — the brief's own
§14 says to "use native semantic HTML for structure and minimal
application layout CSS when appropriate," and a flex/grid wrapper with a
spacing-token `gap` is exactly that; wrapping it in a component would add
a name to learn without adding real behavior over existing CSS +
`--b4-space-*` tokens.

## Effects — removed, by decision

B4 ships **no decorative effects** and no `@b4/react/effects` entry
point. `BorderBeam` and `DistortionWave` were removed 2026-11-19;
`RefractionSweep` and the entry point itself 2026-11-20. The decision is
deliberate: B4's priority is one coherent, exceptionally polished
component system, not a decorative-effects engine. See `CHANGELOG.md`
for the removal record.

This is **not** an unfinished task. Do not re-add them.

Functional motion components are a different thing and were explicitly
kept, as ordinary components in `@b4/react`: `TextMorph`,
`TextTransition`, `NumberTransition`, `AnimatedIndicator`,
`TransitionGroup`, `MorphingSurface`, plus each component's own
microinteractions. They communicate state; the removed effects decorated
it.

## Scope changes log

- **`ToggleGroup` added (2026-11-20) as a genuinely separate control from
  `SegmentedControl`, not a duplicate.** The two are easy to confuse, so
  the split is deliberate and enforced by their visuals:
  `SegmentedControl` is mutually-exclusive selection — exactly one segment
  is always chosen — drawn as a padded track with a travelling capsule
  indicator ("which view am I in"). `ToggleGroup` is a set of on/off
  **buttons** that happen to be adjacent: zero pressed items is a normal
  state, and `multiple` allows several at once ("which of these am I
  turning on"). It therefore borrows `ButtonGroup`'s grouped geometry
  (pill outer, flush square inner edges, hairline separators) and
  `ToggleButton`'s exact pressed/hover/disabled treatment, rather than
  SegmentedControl's capsule. Built on Base UI's own `ToggleGroup`, so it
  adds no second keyboard-navigation manager — roving focus, looping,
  orientation and single/multiple semantics all come from the primitive.

- **Field + FormField merged into one component, `Field`.** The mission
  brief listed them as two separate Family B entries, but once built,
  "Field" (a single control's label/hint/error wrapper) and "FormField"
  (the brief's name for the same concept in form contexts) turned out to
  be the same component with no daylight between them — every Family B
  input (`TextField`, `Textarea`, `PasswordField`, `SearchField`) needs
  exactly this one wrapper, not two different ones. Kept the name `Field`
  since that's what the underlying Base UI primitive is also called.

- **Slider / RangeSlider share one implementation.** Base UI Slider accepts
  a number or array; use Slider with array values for ranges. No separate
  duplicate component is introduced. Both inventory use cases are retained.

- **MultiSelect shares `Select`'s implementation**, same reasoning as
  Slider/RangeSlider: Base UI's `Select.Root` natively supports
  `multiple` with an array value, so a second popup implementation would
  just duplicate it. `MultiSelect`'s trigger shows a comma-joined summary
  of up to two selected labels or a "{n} selected" count beyond that —
  chip-per-item display is a real possible follow-up, not shipped.

- **`ContextMenu` reuses `DropdownMenu`'s item type and CSS classes**
  (`DropdownMenuItem`, `.b4-dropdown-menu__*`) rather than a parallel
  implementation — it's the same visual menu, opened by right-click
  instead of a trigger click.
- **`HoverCard` is Base UI's `preview-card` under the mission brief's
  conventional name.** Base UI itself calls the primitive "PreviewCard";
  this component is named `HoverCard` to match the inventory, same kind
  of naming reconciliation as Slider/RangeSlider.

- **`DatePicker`'s calendar grid is a real, from-scratch ARIA APG Date
  Picker Dialog implementation (not a native `<input type="date">`
  wrapper), with two deliberate v1 scope simplifications, logged
  honestly rather than silently dropped**: weeks always start on Sunday
  (not locale-aware), and there's no Shift+PageUp/PageDown year jump
  (only PageUp/PageDown for month). Both are real, bounded
  simplifications a future session can extend — not faked
  functionality; every other part of the grid (day/week arrow
  navigation, Home/End, month navigation, min/max range enforcement,
  roving tabindex, real keyboard selection) works for real.

- **`TimePicker` composes Base UI's `NumberField` primitive directly
  (two instances: hours, minutes) plus `SegmentedControl` for AM/PM**,
  reusing the exact internal recipe (`FieldControl`/`SteppingInput`/
  `motionCompatibleProps`) `NumberField.tsx` already established,
  rather than inventing a new numeric-stepper pattern. It does not use
  the wrapped `NumberField` *component* itself, since that bundles its
  own `Field` — nesting two of those inside `TimePicker`'s own `Field`
  would duplicate labels/hints.

- **`Sheet` shares `Drawer`'s underlying Base UI `drawer` primitive and
  reuses its backdrop/header/title/description/content CSS classes**
  (`.b4-drawer__*`) — same reasoning as `AlertDialog` reusing `Dialog`'s
  CSS. Only the two components' real visual difference is its own:
  `Drawer` is a right-edge side panel (`swipeDirection="right"`),
  `Sheet` is a bottom-anchored mobile sheet with its own grabber handle
  (`swipeDirection="down"`, `.b4-sheet__popup`/`.b4-sheet__grabber`).
  Both are genuinely separate component files/directories per the
  per-component checklist — this is CSS/primitive reuse, not one
  component wearing two names.

- **SplitButton pulled `DropdownMenu` forward from Family C** rather than
  shipping with a decorative, non-functional chevron. A split button's
  defining feature *is* the attached menu — shipping it without one would
  be exactly the "fake complex functionality with a static mockup"
  failure mode the mission brief prohibits. `DropdownMenu` itself is a
  real Base UI `Menu` composition (keyboard nav, positioning, focus
  management), built once and reused by both the standalone Family C
  component and `SplitButton`.
