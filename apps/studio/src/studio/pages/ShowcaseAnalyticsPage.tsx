import { useMemo, useState } from "react";
import {
  ActivityFeed,
  Card,
  ChartContainer,
  FilterBar,
  PageHeader,
  Select,
  Stat,
  StatusBadge,
} from "@b4/react";
import { analyticsActivity, weeklyRequests } from "../sampleData.js";
import type { StudioPreviewWidth } from "../settings.js";

export function ShowcaseAnalyticsPage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [region, setRegion] = useState<string | null>("eu");
  const [environment, setEnvironment] = useState<string | null>("production");
  const frameClass = previewClass(previewWidth);

  const activeFilters = useMemo(() => {
    const chips = [];
    if (region) chips.push({ id: "region", label: `Region: ${region.toUpperCase()}` });
    if (environment) chips.push({ id: "env", label: `Env: ${environment}` });
    return chips;
  }, [region, environment]);

  const max = Math.max(...weeklyRequests);

  return (
    <div className={["b4-studio__preview-frame", frameClass].filter(Boolean).join(" ")}>
      <PageHeader
        title="Analytics"
        description="Sample product analytics — sample data only, built from public B4 components."
        actions={<StatusBadge status="online">Live sample</StatusBadge>}
      />
      <ShowcaseBody
        region={region}
        onRegion={setRegion}
        environment={environment}
        onEnvironment={setEnvironment}
        activeFilters={activeFilters}
        onClearFilters={() => {
          setRegion(null);
          setEnvironment(null);
        }}
        onRemoveFilter={(id: string) => {
          if (id === "region") setRegion(null);
          if (id === "env") setEnvironment(null);
        }}
        max={max}
      />
    </div>
  );
}

function previewClass(width: StudioPreviewWidth): string {
  if (width === "390") return "b4-studio__preview-frame--390";
  if (width === "768") return "b4-studio__preview-frame--768";
  if (width === "1440") return "b4-studio__preview-frame--1440";
  return "";
}

function ShowcaseBody(props: {
  region: string | null;
  onRegion: (v: string | null) => void;
  environment: string | null;
  onEnvironment: (v: string | null) => void;
  activeFilters: { id: string; label: string }[];
  onClearFilters: () => void;
  onRemoveFilter: (id: string) => void;
  max: number;
}) {
  return (
    <div className="b4-studio__showcase-grid" style={{ marginTop: "var(--b4-space-10)" }}>
      <FilterBar
        activeFilters={props.activeFilters}
        onClearAll={props.onClearFilters}
        onRemoveFilter={props.onRemoveFilter}
      >
        <Select
          label="Region"
          hideLabel
          items={[
            { value: "eu", label: "EU" },
            { value: "us", label: "US" },
            { value: "apac", label: "APAC" },
          ]}
          value={props.region}
          onValueChange={props.onRegion}
        />
        <Select
          label="Environment"
          hideLabel
          items={[
            { value: "production", label: "Production" },
            { value: "staging", label: "Staging" },
          ]}
          value={props.environment}
          onValueChange={props.onEnvironment}
        />
      </FilterBar>
      <ShowcaseStatRow />
      <div className="b4-studio__showcase-row">
        <ChartContainer
          title="Requests"
          description="Last 7 days — illustrative bar chart in SVG."
          legend={[
            { label: "Edge API", color: "var(--b4-accent)" },
            { label: "Web", color: "var(--b4-info)" },
          ]}
        >
          <div className="b4-studio__chart-bars" role="img" aria-label="Weekly request volume">
            {weeklyRequests.map((value, index) => (
              <ChartBar key={index} value={value} max={props.max} index={index} />
            ))}
          </div>
        </ChartContainer>
        <Card variant="raised">
          <ActivityFeed items={analyticsActivity} />
        </Card>
      </div>
    </div>
  );
}

function ShowcaseStatRow() {
  return (
    <div className="b4-studio__hero-grid">
      <Card>
        <Stat label="Active users" value="48.2k" trend={{ label: "+8.1%", direction: "up" }} />
      </Card>
      <Card>
        <Stat label="Error rate" value="0.12%" trend={{ label: "-0.03%", direction: "down" }} />
      </Card>
      <Card>
        <Stat label="P95 latency" value="182 ms" trend={{ label: "+6 ms", direction: "neutral" }} />
      </Card>
    </div>
  );
}

function ChartBar({ value, max, index }: { value: number; max: number; index: number }) {
  const height = `${Math.round((value / max) * 100)}%`;
  return (
    <div
      className="b4-studio__chart-bar"
      style={{
        height,
        background: index % 2 === 0 ? "var(--b4-accent)" : "var(--b4-info)",
      }}
      aria-hidden="true"
    />
  );
}