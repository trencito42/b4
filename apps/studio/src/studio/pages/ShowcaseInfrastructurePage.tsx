import { useState } from "react";
import {
  AlertDialog,
  Button,
  FileExplorer,
  InspectorPanel,
  PageHeader,
  QueryEditor,
  ResizablePanels,
  ResourceMeter,
  StatusBadge,
  toastManager,
} from "@b4/react";
import { infraFiles } from "../sampleData.js";
import type { StudioPreviewWidth } from "../settings.js";

type NodeStatus = "online" | "restarting";

export function ShowcaseInfrastructurePage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [selectedId, setSelectedId] = useState<string | null>("n1");
  const [query, setQuery] = useState("select id, status\nfrom nodes\nwhere region = 'eu'");
  const [nodeStatus, setNodeStatus] = useState<NodeStatus>("online");
  const [restartOpen, setRestartOpen] = useState(false);

  async function handleRestart() {
    setRestartOpen(false);
    setNodeStatus("restarting");
    await new Promise((resolve) => setTimeout(resolve, 1600));
    setNodeStatus("online");
    toastManager.add({ title: "edge-01 restarted", type: "success" });
  }

  const frameClass =
    previewWidth === "390"
      ? "b4-studio__preview-frame--390"
      : previewWidth === "768"
        ? "b4-studio__preview-frame--768"
        : previewWidth === "1440"
          ? "b4-studio__preview-frame--1440"
          : "";

  return (
    <div className={["b4-studio__preview-frame", frameClass].filter(Boolean).join(" ")}>
      <PageHeader
        title="Infrastructure"
        description="Cluster browser, capacity meters, and a query surface — sample data only."
        actions={<StatusBadge status="degraded">Sample cluster</StatusBadge>}
      />
      <div className="b4-studio__infra-stack" style={{ marginTop: "var(--b4-space-10)" }}>
        <ResizablePanels aria-label="Resize cluster panes" defaultSplit={34} minSplit={22} maxSplit={55}>
          <FileExplorer
            data={infraFiles}
            aria-label="Cluster files"
            defaultExpandedIds={["cluster", "nodes"]}
            selectedId={selectedId}
            onSelectedIdChange={setSelectedId}
          />
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-6)", padding: "var(--b4-space-6)" }}>
            <ResourceMeter label="CPU" value={72} max={100} unit="%" />
            <ResourceMeter label="Memory" value={61} max={128} unit="GB" />
            <ResourceMeter label="Object storage" value={4.1} max={5} unit="TB" tone="warning" />
          </div>
        </ResizablePanels>
        <ResizablePanels aria-label="Resize inspector and query" orientation="horizontal" defaultSplit={42}>
          <QueryEditor aria-label="Cluster query" value={query} onValueChange={setQuery} />
          <InspectorPanel
            title={
              <span style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span>edge-01.yaml</span>
                <Button
                  variant="destructive"
                  size="sm"
                  disabled={nodeStatus === "restarting"}
                  onClick={() => setRestartOpen(true)}
                >
                  Restart node
                </Button>
              </span>
            }
            sections={[
              {
                id: "general",
                title: "Instance",
                properties: [
                  { id: "region", label: "Region", value: "eu-west-1" },
                  { id: "role", label: "Role", value: "edge" },
                  {
                    id: "status",
                    label: "Status",
                    value:
                      nodeStatus === "restarting" ? (
                        <StatusBadge status="idle">Restarting…</StatusBadge>
                      ) : (
                        <StatusBadge status="online">Healthy</StatusBadge>
                      ),
                  },
                ],
              },
              {
                id: "network",
                properties: [
                  { id: "ipv4", label: "IPv4", value: "10.24.8.12" },
                  { id: "ipv6", label: "IPv6", value: "2604:…" },
                ],
              },
            ]}
          />
        </ResizablePanels>
        <AlertDialog
          title="Restart edge-01?"
          description="The node will be briefly unreachable while it restarts. This is a sample action — no real node is affected."
          confirmLabel="Restart node"
          open={restartOpen}
          onOpenChange={setRestartOpen}
          onConfirm={handleRestart}
        />
      </div>
    </div>
  );
}