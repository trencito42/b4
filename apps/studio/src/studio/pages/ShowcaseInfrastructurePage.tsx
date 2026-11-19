import { useState } from "react";
import {
  AlertDialog,
  Button,
  DataTable,
  Drawer,
  EmptyState,
  FileExplorer,
  InspectorPanel,
  PageHeader,
  QueryEditor,
  ResourceMeter,
  SearchField,
  Select,
  StatusBadge,
  toastManager,
  type DataTableSort,
} from "@b4/react";
import { infraFiles } from "../sampleData.js";
import type { StudioPreviewWidth } from "../settings.js";

const nodes = [
  { id: "n1", name: "edge-01", region: "eu-west-1", cpu: 72, memory: 61 },
  { id: "n2", name: "edge-02", region: "eu-central-1", cpu: 46, memory: 37 },
];

const regions = [
  { value: "all", label: "All regions" },
  ...nodes.map(({ region }) => ({ value: region, label: region })),
];

export function ShowcaseInfrastructurePage({
  previewWidth,
}: {
  previewWidth: StudioPreviewWidth;
}) {
  const [search, setSearch] = useState("");
  const [region, setRegion] = useState("all");
  const [sort, setSort] = useState<DataTableSort>();
  const [selectedId, setSelectedId] = useState<string | null>("n1");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [restartId, setRestartId] = useState<string | null>(null);
  const [restarting, setRestarting] = useState<string | null>(null);
  const [query, setQuery] = useState("select id, status\nfrom nodes");

  const selected = nodes.find((node) => node.id === selectedId);
  const restartTarget = nodes.find((node) => node.id === restartId);
  const rows = nodes.filter(
    (node) =>
      (region === "all" || node.region === region) &&
      node.name.includes(search.trim().toLowerCase()),
  );
  if (sort) {
    const direction = sort.direction === "asc" ? 1 : -1;
    rows.sort(
      (a, b) =>
        direction *
        (sort.columnKey === "cpu" ? a.cpu - b.cpu : a.name.localeCompare(b.name)),
    );
  }

  async function restart() {
    if (!restartTarget || restarting) return;
    setRestartId(null);
    setRestarting(restartTarget.id);
    await new Promise((resolve) => setTimeout(resolve, 900));
    setRestarting(null);
    toastManager.add({ title: restartTarget.name + " restarted", type: "success" });
  }

  function showNode(id: string) {
    setSelectedId(id);
    setDetailsOpen(true);
  }

  const frameClass =
    previewWidth === "full" ? "" : "b4-studio__preview-frame--" + previewWidth;
  return (
    <div className={["b4-studio__preview-frame", frameClass].filter(Boolean).join(" ")}>
      <PageHeader
        title="Infrastructure"
        description="Filter cluster nodes, inspect capacity and run a simulated restart."
        actions={<StatusBadge status="online">Sample cluster</StatusBadge>}
      />
      <div className="b4-studio__infra-stack">
        <div className="b4-studio__visual-controls">
          <SearchField
            label="Find a node"
            placeholder="Search by node name"
            value={search}
            onValueChange={setSearch}
          />
          <Select
            label="Region"
            items={regions}
            value={region}
            onValueChange={(value) => setRegion(value ?? "all")}
          />
        </div>
        {rows.length ? (
          <DataTable
            caption="Cluster nodes"
            columns={[
              { key: "name", header: "Node", sortable: true },
              { key: "region", header: "Region" },
              {
                key: "cpu",
                header: "CPU",
                sortable: true,
                render: (node) => node.cpu + "%",
              },
              {
                key: "state",
                header: "Status",
                render: (node) => (
                  <StatusBadge status={node.id === restarting ? "idle" : "online"}>
                    {node.id === restarting ? "Restarting" : "Healthy"}
                  </StatusBadge>
                ),
              },
              {
                key: "details",
                header: "Details",
                render: (node) => (
                  <Button size="sm" variant="ghost" onClick={() => showNode(node.id)}>
                    Inspect {node.name}
                  </Button>
                ),
              },
            ]}
            rows={rows}
            getRowId={(node) => node.id}
            sort={sort}
            onSortChange={setSort}
          />
        ) : (
          <EmptyState title="No matching nodes" />
        )}
        <div className="b4-studio__infra-browser">
          <FileExplorer
            data={infraFiles}
            aria-label="Cluster files"
            defaultExpandedIds={["cluster", "nodes"]}
            selectedId={selectedId}
            onSelectedIdChange={(id) => {
              if (id && nodes.some((node) => node.id === id)) showNode(id);
              else setSelectedId(id);
            }}
          />
          <QueryEditor
            aria-label="Cluster query"
            value={query}
            onValueChange={setQuery}
          />
        </div>
      </div>
      <Drawer
        title={selected?.name ?? "Node details"}
        open={detailsOpen}
        onOpenChange={setDetailsOpen}
      >
        {selected && (
          <div className="b4-studio__infra-stack">
            <InspectorPanel
              title="Instance"
              sections={[
                {
                  id: "general",
                  properties: [
                    { id: "region", label: "Region", value: selected.region },
                    {
                      id: "status",
                      label: "Status",
                      value: selected.id === restarting ? "Restarting" : "Healthy",
                    },
                  ],
                },
              ]}
            />
            <ResourceMeter label="CPU" value={selected.cpu} max={100} unit="%" />
            <ResourceMeter label="Memory" value={selected.memory} max={128} unit="GB" />
            <Button
              variant="destructive"
              disabled={Boolean(restarting)}
              onClick={() => setRestartId(selected.id)}
            >
              Restart node
            </Button>
          </div>
        )}
      </Drawer>
      <AlertDialog
        title={"Restart " + (restartTarget?.name ?? "node") + "?"}
        description="The sample node will be briefly unavailable."
        confirmLabel="Restart node"
        open={Boolean(restartTarget)}
        onOpenChange={(open) => {
          if (!open) setRestartId(null);
        }}
        onConfirm={restart}
      />
    </div>
  );
}
