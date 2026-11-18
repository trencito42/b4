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
| DatePicker | PLANNED |
| TimePicker | PLANNED |
| ColorPicker | PLANNED |
| FileUpload | PLANNED |
| Field | **VERIFIED** (full CLI regression gate closed 2026-11-17, see QUALITY_MATRIX.md) |

## Family C — Navigation & Overlays

| Component | Status |
|---|---|
| DropdownMenu | **VERIFIED** |
| Tabs | **VERIFIED** |
| Accordion | **VERIFIED** |
| Breadcrumbs | PLANNED |
| Pagination | PLANNED |
| Stepper | PLANNED |
| NavigationMenu | PLANNED |
| ContextMenu | PLANNED |
| Tooltip | **VERIFIED** |
| Popover | **VERIFIED** |
| HoverCard | PLANNED |
| Dialog | **VERIFIED** |
| AlertDialog | PLANNED |
| Drawer | PLANNED |
| Sheet | PLANNED |
| CommandPalette | PLANNED |
| TreeView | PLANNED |

## Family D — Data & Content

Card, InteractiveCard, DataTable, DataGrid, Progress, CircularProgress, Stat,
Timeline, ActivityFeed, Calendar, CodeBlock, EmptyState, ErrorState,
Skeleton, ChartContainer — all **PLANNED**. DataGrid must be a real
virtualized/sortable/filterable grid, not a styled `<table>` — see mission
brief's "specialized components" note.

## Family E — Feedback & Motion

| Component | Status |
|---|---|
| TextTransition | **VERIFIED** |
| NumberTransition | **VERIFIED** |
| AnimatedIndicator | **VERIFIED** (incl. span-as-root support added for RadioGroup) |
| Toast | PLANNED |
| InlineAlert | PLANNED |
| NotificationPanel | PLANNED |
| Spinner | PLANNED (Button already has an inline spinner for its own `loading` state; a standalone `Spinner` component for use outside Button doesn't exist yet) |
| MorphingSurface | PLANNED |
| ExpandingAction | PLANNED |
| TransitionGroup | PLANNED |
| LoadingOverlay | PLANNED |

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

- **SplitButton pulled `DropdownMenu` forward from Family C** rather than
  shipping with a decorative, non-functional chevron. A split button's
  defining feature *is* the attached menu — shipping it without one would
  be exactly the "fake complex functionality with a static mockup"
  failure mode the mission brief prohibits. `DropdownMenu` itself is a
  real Base UI `Menu` composition (keyboard nav, positioning, focus
  management), built once and reused by both the standalone Family C
  component and `SplitButton`.
