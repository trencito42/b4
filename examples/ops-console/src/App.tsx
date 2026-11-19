import { useEffect, useMemo, useState } from "react";
import {
  ActivityFeed,
  AlertDialog,
  AppShell,
  AppShellMobileTrigger,
  Avatar,
  AvatarGroup,
  Badge,
  Breadcrumbs,
  Button,
  ButtonGroup,
  Card,
  CommandPalette,
  Combobox,
  Dialog,
  Drawer,
  DropdownMenu,
  EmptyState,
  FilterBar,
  IconButton,
  InlineAlert,
  InspectorPanel,
  KeyboardShortcut,
  Link,
  MultiSelect,
  NotificationPanel,
  PageHeader,
  Popover,
  Progress,
  ResizablePanels,
  ResourceMeter,
  SearchField,
  Select,
  Sheet,
  Sidebar,
  Stat,
  StatusBadge,
  Tabs,
  Textarea,
  Timeline,
  ToastProvider,
  ToggleButton,
  Toolbar,
  ToolbarButton,
  ToolbarGroup,
  ToolbarIconButton,
  ToolbarSeparator,
  Tooltip,
  useToast,
  type ActiveFilter,
  type CommandPaletteItem,
  type DataTableSort,
  type DropdownMenuItem,
  type InspectorSection,
  type MultiSelectItem,
  type SelectItem,
  type SidebarSection,
} from "@b4/react";

import {
  incidentActivity,
  incidentTimeline,
  incidents,
  notifications,
  people,
  resourceMeters,
  services,
  severityMeta,
  statTiles,
  statusMeta,
  type Incident,
} from "./data.js";
import { IncidentsTable } from "./IncidentsTable.js";
import { ThemeToggle, useB4Theme } from "./theme.js";

const severityItems: SelectItem[] = [
  { value: "sev1", label: "SEV-1", description: "Customer-facing outage" },
  { value: "sev2", label: "SEV-2", description: "Partial degradation" },
  { value: "sev3", label: "SEV-3", description: "Minor degradation" },
  { value: "sev4", label: "SEV-4", description: "Internal only" },
];

const serviceItems: MultiSelectItem[] = services.map((service) => ({
  value: service,
  label: service,
}));

const ownerItems: SelectItem[] = people.map((person) => ({
  value: person.name,
  label: person.name,
  description: person.role,
}));

const sidebarSections: SidebarSection[] = [
  {
    id: "monitor",
    label: "Monitor",
    items: [
      { id: "overview", label: "Overview" },
      { id: "incidents", label: "Incidents" },
      { id: "alerts", label: "Alert rules" },
    ],
  },
  {
    id: "operate",
    label: "Operate",
    items: [
      { id: "services", label: "Services" },
      { id: "deploys", label: "Deployments" },
      { id: "rota", label: "On-call rota" },
    ],
  },
  {
    id: "audit",
    label: "Audit",
    items: [
      { id: "changes", label: "Change log" },
      { id: "postmortems", label: "Post-mortems" },
    ],
  },
];

const userMenuItems: DropdownMenuItem[] = [
  { value: "profile", label: "Profile" },
  {
    value: "preferences",
    label: (
      <span className="ops-menu-item">
        Preferences
        <KeyboardShortcut keys={["Ctrl", ","]} />
      </span>
    ),
  },
  { value: "sign-out", label: "Sign out", destructive: true },
];

const commandItems: CommandPaletteItem[] = [
  { value: "new-incident", label: "Declare an incident", shortcut: ["Ctrl", "I"] },
  { value: "escalate", label: "Escalate the selected incident", shortcut: ["Ctrl", "E"] },
  { value: "export", label: "Export the queue as CSV" },
  { value: "handover", label: "Open the shift handover notes" },
  { value: "runbook", label: "Open the checkout runbook" },
];

const BellIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M6 9a6 6 0 1 1 12 0c0 3.5 1.5 5 1.5 5h-15S6 12.5 6 9Z" strokeLinejoin="round" />
    <path d="M10 18a2 2 0 0 0 4 0" strokeLinecap="round" />
  </svg>
);

const CommandIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M9 6a2 2 0 1 0-2 2h10a2 2 0 1 0-2-2v12a2 2 0 1 0 2-2H7a2 2 0 1 0 2 2V6Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const RefreshIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <path d="M20 12a8 8 0 1 1-2.6-5.9" strokeLinecap="round" />
    <path d="M20 4v4h-4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ColumnsIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    <rect x="4" y="5" width="6" height="14" rx="1.5" />
    <rect x="14" y="5" width="6" height="14" rx="1.5" />
  </svg>
);

function sortIncidents(rows: Incident[], sort: DataTableSort): Incident[] {
  const direction = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    switch (sort.columnKey) {
      case "severity":
        return (severityMeta[a.severity].rank - severityMeta[b.severity].rank) * direction;
      case "title":
        return a.title.localeCompare(b.title) * direction;
      default:
        return a.id.localeCompare(b.id) * direction;
    }
  });
}

export function App() {
  return (
    <ToastProvider>
      <OperationsConsole />
    </ToastProvider>
  );
}

function OperationsConsole() {
  const { theme, setTheme } = useB4Theme();
  const toast = useToast();

  const [activeNav, setActiveNav] = useState("incidents");
  const [query, setQuery] = useState("");
  const [severity, setSeverity] = useState<string | null>(null);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [owner, setOwner] = useState<string | null>(null);
  const [sort, setSort] = useState<DataTableSort>({ columnKey: "severity", direction: "asc" });
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeIncidentId, setActiveIncidentId] = useState<string>(incidents[0]?.id ?? "");
  const [live, setLive] = useState(true);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [escalateOpen, setEscalateOpen] = useState(false);
  const [handoverOpen, setHandoverOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [escalationNote, setEscalationNote] = useState("");

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setPaletteOpen(true);
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const rows = useMemo(() => {
    const needle = query.trim().toLowerCase();
    const filtered = incidents.filter((incident) => {
      if (needle) {
        const haystack = `${incident.id} ${incident.title} ${incident.service}`.toLowerCase();
        if (!haystack.includes(needle)) return false;
      }
      if (severity && incident.severity !== severity) return false;
      if (selectedServices.length > 0 && !selectedServices.includes(incident.service)) return false;
      if (owner && incident.owner.name !== owner) return false;
      return true;
    });
    return sortIncidents(filtered, sort);
  }, [query, severity, selectedServices, owner, sort]);

  const activeIncident = incidents.find((incident) => incident.id === activeIncidentId);

  const activeFilters: ActiveFilter[] = [];
  if (query.trim()) activeFilters.push({ id: "query", label: `“${query.trim()}”` });
  if (severity) activeFilters.push({ id: "severity", label: severityMeta[severity as keyof typeof severityMeta].label });
  if (owner) activeFilters.push({ id: "owner", label: owner });
  if (selectedServices.length > 0) {
    activeFilters.push({ id: "service", label: `${selectedServices.length} service${selectedServices.length > 1 ? "s" : ""}` });
  }

  function removeFilter(id: string) {
    if (id === "query") setQuery("");
    if (id === "severity") setSeverity(null);
    if (id === "owner") setOwner(null);
    if (id === "service") setSelectedServices([]);
  }

  function clearFilters() {
    setQuery("");
    setSeverity(null);
    setOwner(null);
    setSelectedServices([]);
  }

  const inspectorSections: InspectorSection[] = activeIncident
    ? [
        {
          id: "summary",
          title: "Summary",
          properties: [
            { id: "service", label: "Service", value: activeIncident.service },
            {
              id: "severity",
              label: "Severity",
              value: (
                <Badge tone={severityMeta[activeIncident.severity].tone}>
                  {severityMeta[activeIncident.severity].label}
                </Badge>
              ),
            },
            {
              id: "status",
              label: "Status",
              value: (
                <StatusBadge status={statusMeta[activeIncident.status].badge}>
                  {statusMeta[activeIncident.status].label}
                </StatusBadge>
              ),
            },
            { id: "owner", label: "Owner", value: activeIncident.owner.name },
            { id: "opened", label: "Opened", value: activeIncident.opened },
          ],
        },
        {
          id: "impact",
          title: "Impact",
          properties: [
            { id: "regions", label: "Regions", value: activeIncident.regions.join(", ") },
            { id: "errorRate", label: "Error rate", value: `${activeIncident.errorRate}%` },
            {
              id: "sla",
              label: "Response SLA remaining",
              value: (
                <Progress
                  label="Response SLA remaining"
                  hideLabel
                  value={activeIncident.slaPercent}
                  showValue={false}
                />
              ),
            },
          ],
        },
        {
          id: "responders",
          title: "Responders",
          properties: [
            {
              id: "responders",
              label: "On call",
              value: <AvatarGroup people={activeIncident.responders} max={3} size="sm" />,
            },
            { id: "tags", label: "Tags", value: activeIncident.tags.join(", ") },
          ],
        },
      ]
    : [];

  function handleArchive() {
    toast.add({
      title: "Incident archived",
      description: activeIncident
        ? `${activeIncident.id} was moved to the change log.`
        : "The incident was moved to the change log.",
      type: "success",
    });
  }

  function handleEscalate() {
    setEscalateOpen(false);
    setEscalationNote("");
    toast.add({
      title: "Incident escalated",
      description: "The on-call rotation has been notified.",
      type: "warning",
    });
  }

  function handleCommand(value: string) {
    if (value === "new-incident") setEscalateOpen(true);
    if (value === "escalate") setEscalateOpen(true);
    if (value === "export") {
      toast.add({ title: "Export queued", description: "The CSV will be emailed to you.", type: "info" });
    }
    if (value === "handover") setHandoverOpen(true);
    if (value === "runbook") {
      toast.add({ title: "Runbook opened", description: "Checkout mitigation, page 4.", type: "info" });
    }
  }

  const header = (
    <div className="ops-header">
      <div className="ops-header__identity">
        <AppShellMobileTrigger />
        <span className="ops-header__brand">Northwind Supply</span>
        <StatusBadge status="online">All regions nominal</StatusBadge>
      </div>

      <div className="ops-header__search">
        <SearchField
          label="Search incidents"
          hideLabel
          placeholder="Search by id, summary or service"
          value={query}
          onValueChange={setQuery}
        />
        <span className="ops-header__shortcut" aria-hidden="true">
          <KeyboardShortcut keys={["Ctrl", "K"]} />
        </span>
      </div>

      <div className="ops-header__actions">
        <ThemeToggle theme={theme} onThemeChange={setTheme} />
        <Tooltip content="Open the command palette">
          <IconButton
            variant="ghost"
            aria-label="Open command palette"
            icon={CommandIcon}
            onClick={() => setPaletteOpen(true)}
          />
        </Tooltip>
        <NotificationPanel
          items={notifications}
          trigger={<IconButton variant="ghost" aria-label="Notifications" icon={BellIcon} />}
          onItemClick={(id) =>
            toast.add({ title: "Notification opened", description: `Item ${id} selected.`, type: "info" })
          }
          onMarkAllRead={() =>
            toast.add({ title: "All notifications marked as read", type: "success" })
          }
        />
        <DropdownMenu
          items={userMenuItems}
          onSelect={(value) =>
            toast.add({ title: "Account", description: `Selected “${value}”.`, type: "info" })
          }
          trigger={
            <IconButton variant="ghost" aria-label="Account menu" icon={<Avatar name="Ada Okonkwo" size="sm" />} />
          }
        />
      </div>
    </div>
  );

  const sidebar = (
    <Sidebar
      activeItemId={activeNav}
      sections={sidebarSections.map((section) => ({
        ...section,
        items: section.items.map((item) => ({
          ...item,
          onClick: () => setActiveNav(item.id),
        })),
      }))}
    />
  );

  return (
    <>
      <AppShell header={header} sidebar={sidebar} sidebarLabel="Operations">
        <div className="ops-page">
          <PageHeader
            title="Incidents"
            description="Live incident queue for Northwind Supply production services."
            breadcrumbs={
              <Breadcrumbs
                aria-label="Breadcrumb"
                items={[
                  { label: "Operations", href: "#operations" },
                  { label: "Production", href: "#production" },
                  { label: "Incidents" },
                ]}
              />
            }
            actions={
              <ButtonGroup aria-label="Incident page actions">
                <Button
                  variant="secondary"
                  onClick={() =>
                    toast.add({
                      title: "Export queued",
                      description: "The queue will be emailed as a CSV.",
                      type: "info",
                    })
                  }
                >
                  Export CSV
                </Button>
                <AlertDialog
                  title="Archive the selected incident?"
                  description="Archiving removes the incident from the live queue. The record is kept in the change log and can be restored."
                  confirmLabel="Archive incident"
                  onConfirm={handleArchive}
                  trigger={<Button variant="destructive">Archive incident</Button>}
                />
              </ButtonGroup>
            }
          />

          <InlineAlert tone="warning" title="Elevated error rate in eu-west-1">
            Two services are shedding load while the mitigation lands.{" "}
            <Link href="#incident-workspace" tone="neutral">
              Jump to the incident workspace
            </Link>
          </InlineAlert>

          <div className="ops-stats">
            {statTiles.map((tile) => (
              <Card key={tile.label} variant="flat" padding="md">
                <Stat
                  label={tile.label}
                  value={tile.value}
                  description={tile.description}
                  trend={tile.trend}
                />
              </Card>
            ))}
          </div>

          <div className="ops-meters">
            {resourceMeters.map((meter) => (
              <ResourceMeter
                key={meter.label}
                label={meter.label}
                value={meter.value}
                max={meter.max}
                unit={meter.unit}
              />
            ))}
          </div>

          <div className="ops-workspace" id="incident-workspace">
            <ResizablePanels
              aria-label="Incident workspace"
              defaultSplit={62}
              minSplit={35}
              maxSplit={80}
              className="ops-panels"
            >
              <section className="ops-pane ops-pane--table" aria-label="Incident queue">
                <FilterBar
                  activeFilters={activeFilters}
                  onRemoveFilter={removeFilter}
                  onClearAll={clearFilters}
                >
                  <Select
                    label="Severity"
                    hideLabel
                    items={severityItems}
                    value={severity}
                    onValueChange={setSeverity}
                    placeholder="Any severity"
                  />
                  <MultiSelect
                    label="Service"
                    hideLabel
                    items={serviceItems}
                    value={selectedServices}
                    onValueChange={setSelectedServices}
                    placeholder="Any service"
                  />
                  <Combobox
                    label="Owner"
                    hideLabel
                    items={ownerItems}
                    value={owner}
                    onValueChange={setOwner}
                    placeholder="Any owner"
                  />
                </FilterBar>

                <div className="ops-table-toolbar">
                  <Toolbar aria-label="Incident table actions">
                    <ToolbarGroup>
                      <ToolbarButton
                        variant="secondary"
                        onClick={() =>
                          toast.add({
                            title: "Assignment queued",
                            description: "The rota will pick the next responder.",
                            type: "info",
                          })
                        }
                      >
                        Assign
                      </ToolbarButton>
                      <ToolbarButton
                        variant="secondary"
                        onClick={() =>
                          toast.add({ title: "Snoozed for one hour", type: "info" })
                        }
                      >
                        Snooze
                      </ToolbarButton>
                    </ToolbarGroup>
                    <ToolbarSeparator />
                    <ToolbarGroup>
                      <Tooltip content="Refresh the incident queue">
                        <ToolbarIconButton
                          icon={RefreshIcon}
                          aria-label="Refresh incidents"
                          onClick={() =>
                            toast.add({ title: "Queue refreshed", type: "success" })
                          }
                        />
                      </Tooltip>
                      <ToolbarIconButton
                        icon={ColumnsIcon}
                        aria-label="Choose visible columns"
                        onClick={() =>
                          toast.add({ title: "Column chooser opened", type: "info" })
                        }
                      />
                    </ToolbarGroup>
                  </Toolbar>

                  <div className="ops-table-toolbar__side">
                    <ToggleButton pressed={live} onPressedChange={setLive} size="sm">
                      Live
                    </ToggleButton>
                    <Popover
                      title="Severity legend"
                      trigger={
                        <Button variant="ghost" size="sm">
                          Legend
                        </Button>
                      }
                    >
                      <ul className="ops-legend">
                        {Object.entries(severityMeta).map(([key, meta]) => (
                          <li key={key} className="ops-legend__item">
                            <Badge tone={meta.tone}>{meta.label}</Badge>
                            <span className="ops-legend__text">{meta.description}</span>
                          </li>
                        ))}
                      </ul>
                    </Popover>
                    <Button variant="secondary" size="sm" onClick={() => setDetailOpen(true)}>
                      Detail panel
                    </Button>
                  </div>
                </div>

                {rows.length === 0 ? (
                  <EmptyState
                    title="No incidents match these filters"
                    description="Try clearing the severity, service or owner filters."
                    action={
                      <Button variant="secondary" onClick={clearFilters}>
                        Clear all filters
                      </Button>
                    }
                  />
                ) : (
                  <div className="ops-table-wrap">
                    <IncidentsTable
                      rows={rows}
                      sort={sort}
                      onSortChange={setSort}
                      selectedIds={selectedIds}
                      onSelectedIdsChange={setSelectedIds}
                      activeIncidentId={activeIncidentId}
                      onActivateIncident={(incident) => setActiveIncidentId(incident.id)}
                    />
                  </div>
                )}
              </section>

              <section className="ops-pane ops-pane--context" aria-label="Incident context">
                <InspectorPanel
                  title={activeIncident ? activeIncident.id : "No incident selected"}
                  sections={inspectorSections}
                />

                <Tabs
                  aria-label="Incident context"
                  defaultValue="timeline"
                  items={[
                    {
                      value: "timeline",
                      label: "Timeline",
                      content: (
                        <Timeline
                          items={incidentTimeline.map((entry) => ({
                            id: entry.id,
                            title: entry.title,
                            description: entry.description,
                            timestamp: entry.timestamp,
                            tone: entry.tone,
                          }))}
                        />
                      ),
                    },
                    {
                      value: "activity",
                      label: "Activity",
                      content: (
                        <ActivityFeed
                          items={incidentActivity.map((entry) => ({
                            id: entry.id,
                            actorName: entry.actorName,
                            action: entry.action,
                            timestamp: entry.timestamp,
                          }))}
                        />
                      ),
                    },
                    {
                      value: "runbook",
                      label: "Runbook",
                      content: (
                        <div className="ops-runbook">
                          <p>
                            Raise the gateway connection pool, drain the queue, then watch the error
                            budget for fifteen minutes before declaring recovery.
                          </p>
                          <Link href="#runbook" tone="neutral">
                            Open the full checkout runbook
                          </Link>
                        </div>
                      ),
                    },
                  ]}
                />
              </section>
            </ResizablePanels>
          </div>
        </div>
      </AppShell>

      <Dialog
        title="Escalate incident"
        description="Escalation pages the secondary rotation and freezes automated rollbacks."
        open={escalateOpen}
        onOpenChange={setEscalateOpen}
      >
        <div className="ops-dialog">
          <Select
            label="Escalate to"
            items={ownerItems}
            defaultValue="Ravi Menon"
            hint="The escalation target is notified immediately."
          />
          <Textarea
            label="Escalation note"
            rows={4}
            value={escalationNote}
            onChange={(event) => setEscalationNote(event.target.value)}
            placeholder="What changed since the last update?"
          />
          <div className="ops-dialog__actions">
            <Button variant="secondary" onClick={() => setEscalateOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleEscalate}>
              Escalate
            </Button>
          </div>
        </div>
      </Dialog>

      <Sheet
        title="Shift handover notes"
        description="Notes from the previous on-call rotation."
        open={handoverOpen}
        onOpenChange={setHandoverOpen}
      >
        <ul className="ops-handover">
          <li>Pool ceiling raised on the gateway fleet at 08:44.</li>
          <li>Two deploys are paused in the checkout pipeline until the queue drains.</li>
          <li>Customer updates are posted every thirty minutes until recovery.</li>
        </ul>
        <Button
          variant="primary"
          onClick={() => {
            setHandoverOpen(false);
            toast.add({ title: "Handover acknowledged", type: "success" });
          }}
        >
          Acknowledge handover
        </Button>
      </Sheet>

      <Drawer
        title="Incident detail"
        description={activeIncident ? activeIncident.title : "No incident selected"}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      >
        <div className="ops-drawer">
          {activeIncident ? (
            <>
              <div className="ops-drawer__badges">
                <Badge tone={severityMeta[activeIncident.severity].tone}>
                  {severityMeta[activeIncident.severity].label}
                </Badge>
                <StatusBadge status={statusMeta[activeIncident.status].badge}>
                  {statusMeta[activeIncident.status].label}
                </StatusBadge>
              </div>
              <ActivityFeed
                items={incidentActivity.map((entry) => ({
                  id: entry.id,
                  actorName: entry.actorName,
                  action: entry.action,
                  timestamp: entry.timestamp,
                }))}
              />
            </>
          ) : (
            <EmptyState title="Nothing selected" description="Pick an incident from the queue." />
          )}
        </div>
      </Drawer>

      <CommandPalette
        items={commandItems}
        onSelect={handleCommand}
        open={paletteOpen}
        onOpenChange={setPaletteOpen}
        aria-label="Command palette"
      />
    </>
  );
}
