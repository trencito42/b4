# B4 — Component Inventory

Status values match `QUALITY_MATRIX.md`: PLANNED / IMPLEMENTING / IMPLEMENTED
/ TESTING / VERIFIED / BLOCKED. This file is the scope contract — components
are not silently dropped; if scope changes, it changes here with a reason.

## Family A — Actions & Identity

| Component | Status |
|---|---|
| Button | **VERIFIED** (see `QUALITY_MATRIX.md`) |
| IconButton | PLANNED |
| ButtonGroup | PLANNED |
| SplitButton | PLANNED |
| ToggleButton | PLANNED |
| SegmentedControl | **VERIFIED** — the Phase 1 quality reference component (Changelog/Login sliding-capsule control named in the mission brief) |
| Link | PLANNED |
| Badge | PLANNED |
| StatusBadge | PLANNED |
| Avatar | PLANNED |
| AvatarGroup | PLANNED |
| KeyboardShortcut | PLANNED |

## Family B — Forms & Inputs

TextField, Textarea, PasswordField, SearchField, NumberField, InputGroup,
Checkbox, RadioGroup, Switch, Select, Combobox, MultiSelect, Slider,
RangeSlider, DatePicker, TimePicker, ColorPicker, FileUpload, Field,
FormField — all **PLANNED**.

## Family C — Navigation & Overlays

Tabs, Accordion, Breadcrumbs, Pagination, Stepper, NavigationMenu,
DropdownMenu, ContextMenu, Tooltip, Popover, HoverCard, Dialog, AlertDialog,
Drawer, Sheet, CommandPalette, TreeView — all **PLANNED**.

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
| AnimatedIndicator | **VERIFIED** |
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

None yet. Any future rationalization (merge/split/rename) of a listed
component gets an entry here with the reason, not a silent removal.
