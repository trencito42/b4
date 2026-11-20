export interface StudioComponent {
  name: string;
  status: "VERIFIED";
  /** Storybook story path segment after the family slug. */
  storySlug: string;
}

export interface StudioFamily {
  id: string;
  title: string;
  storybookFamilySlug: string;
  components: StudioComponent[];
}

/**
 * Storybook's own slugification (storybook/internal/csf) lowercases the
 * title and turns spaces/punctuation into "-", but it does NOT split
 * camelCase: "IconButton" becomes "iconbutton", never "icon-button".
 *
 * The previous helper here inserted the hyphen itself, which produced a
 * dead deep link for every multi-word component name — 62 of the 83
 * catalog links pointed at a story that does not exist. `scripts/
 * craftsmanship-audit.mjs` now re-derives every link from the real story
 * titles and fails the build if one drifts again.
 */
function slug(name: string): string {
  return name.toLowerCase();
}

function c(name: string): StudioComponent {
  return { name, status: "VERIFIED", storySlug: slug(name) };
}

export const STUDIO_FAMILIES: StudioFamily[] = [
  {
    id: "a",
    title: "Actions & Identity",
    storybookFamilySlug: "family-a-actions-identity",
    components: [
      c("Button"),
      c("IconButton"),
      c("ButtonGroup"),
      c("SplitButton"),
      c("ToggleButton"),
      c("ToggleGroup"),
      c("SegmentedControl"),
      c("Link"),
      c("Badge"),
      c("StatusBadge"),
      c("Avatar"),
      c("AvatarGroup"),
      c("KeyboardShortcut"),
    ],
  },
  {
    id: "b",
    title: "Forms & Inputs",
    storybookFamilySlug: "family-b-forms-inputs",
    components: [
      c("Checkbox"),
      c("Switch"),
      c("RadioGroup"),
      c("TextField"),
      c("Textarea"),
      c("PasswordField"),
      c("SearchField"),
      c("NumberField"),
      c("InputOTP"),
      c("TagsInput"),
      c("InputGroup"),
      c("Select"),
      c("Combobox"),
      c("MultiSelect"),
      c("Slider"),
      c("DatePicker"),
      c("TimePicker"),
      c("ColorPicker"),
      c("FileUpload"),
      c("Field"),
    ],
  },
  {
    id: "c",
    title: "Navigation & Overlays",
    storybookFamilySlug: "family-c-navigation-overlays",
    components: [
      c("DropdownMenu"),
      c("Tabs"),
      c("Accordion"),
      c("Breadcrumbs"),
      c("Pagination"),
      c("Stepper"),
      c("NavigationMenu"),
      c("ContextMenu"),
      c("Tooltip"),
      c("Popover"),
      c("HoverCard"),
      c("Dialog"),
      c("AlertDialog"),
      c("Drawer"),
      c("Sheet"),
      c("CommandPalette"),
      c("TreeView"),
    ],
  },
  {
    id: "d",
    title: "Data & Content",
    storybookFamilySlug: "family-d-data-content",
    components: [
      c("Progress"),
      c("CircularProgress"),
      c("Card"),
      c("InteractiveCard"),
      c("DataTable"),
      c("DataGrid"),
      c("Stat"),
      c("Timeline"),
      c("ActivityFeed"),
      c("Calendar"),
      c("CodeBlock"),
      c("EmptyState"),
      c("ErrorState"),
      c("Skeleton"),
      c("ChartContainer"),
    ],
  },
  {
    id: "e",
    title: "Feedback & Motion",
    storybookFamilySlug: "family-e-feedback-motion",
    components: [
      c("TextTransition"),
      c("NumberTransition"),
      c("TextMorph"),
      c("AnimatedIndicator"),
      c("Toast"),
      c("InlineAlert"),
      c("NotificationPanel"),
      c("Spinner"),
      c("MorphingSurface"),
      c("ExpandingAction"),
      c("TransitionGroup"),
      c("LoadingOverlay"),
    ],
  },
  {
    id: "f",
    title: "Application Patterns",
    storybookFamilySlug: "family-f-application-patterns",
    components: [
      c("AppShell"),
      c("Sidebar"),
      c("PageHeader"),
      c("Toolbar"),
      c("FilterBar"),
      c("InspectorPanel"),
      c("ResizablePanels"),
      c("ResourceMeter"),
      c("FileExplorer"),
      c("QueryEditor"),
    ],
  },
  {
    id: "g",
    title: "Layout Primitives",
    storybookFamilySlug: "family-g-layout-primitives",
    components: [c("Separator"), c("VisuallyHidden"), c("AspectRatio"), c("Collapsible"), c("ScrollArea")],
  },
];

export const STUDIO_COMPONENT_COUNT = STUDIO_FAMILIES.reduce(
  (sum, family) => sum + family.components.length,
  0,
);

export function findComponents(query: string): Array<StudioComponent & { family: StudioFamily }> {
  const needle = query.trim().toLowerCase();
  const matches: Array<StudioComponent & { family: StudioFamily }> = [];
  for (const family of STUDIO_FAMILIES) {
    for (const component of family.components) {
      if (!needle || component.name.toLowerCase().includes(needle) || family.title.toLowerCase().includes(needle)) {
        matches.push({ ...component, family });
      }
    }
  }
  return matches;
}