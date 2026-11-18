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
| SegmentedControl | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| Link | **VERIFIED** |
| Badge | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |
| StatusBadge | **VERIFIED** |
| Avatar | **VERIFIED** |
| AvatarGroup | **VERIFIED** |
| KeyboardShortcut | **VERIFIED** |

## Family B — Forms & Inputs

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
| Card | PLANNED |
| InteractiveCard | PLANNED |
| DataTable | PLANNED |
| DataGrid | PLANNED |
| Stat | PLANNED |
| Timeline | PLANNED |
| ActivityFeed | PLANNED |
| Calendar | PLANNED |
| CodeBlock | PLANNED |
| EmptyState | PLANNED |
| ErrorState | PLANNED |
| Skeleton | **VERIFIED** (full CLI regression gate closed 2026-11-18, see QUALITY_MATRIX.md) |
| ChartContainer | PLANNED |

DataGrid must be a real virtualized/sortable/filterable grid, not a styled
`<table>` — see mission brief's "specialized components" note.

## Family E — Feedback & Motion

| Component | Status |
|---|---|
| TextTransition | **VERIFIED** |
| NumberTransition | **VERIFIED** |
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

AppShell, Sidebar, PageHeader, Toolbar, FilterBar, InspectorPanel,
ResizablePanels, ResourceMeter, FileExplorer, QueryEditor — all **PLANNED**.
FileExplorer and QueryEditor must have real functionality (actual tree
navigation / actual syntax-aware editing), not static mockups.

## Scope changes log

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
