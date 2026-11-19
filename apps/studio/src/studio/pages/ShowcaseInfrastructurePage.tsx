import { useState } from "react";
import {
  FileExplorer,
  InspectorPanel,
  PageHeader,
  QueryEditor,
  ResizablePanels,
  ResourceMeter,
  StatusBadge,
} from "@b4/react";
import { infraFiles } from "../sampleData.js";
import type { StudioPreviewWidth } from "../settings.js";

export function ShowcaseInfrastructurePage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [selectedId, setSelectedId] = useState<string | null>("n1");
  const [query, setQuery] = useState("select id, status\nfrom nodes\nwhere region = 'eu'");

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
            title="edge-01.yaml"
            sections={[
              {
                id: "general",
                title: "Instance",
                properties: [
                  { id: "region", label: "Region", value: "eu-west-1" },
                  { id: "role", label: "Role", value: "edge" },
                  { id: "status", label: "Status", value: <StatusBadge status="online">Healthy</StatusBadge> },
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
      </div>
    </div>
  );
}