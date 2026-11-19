import { useState } from "react";
import {
  Button,
  SegmentedControl,
  Tabs,
  RadioGroup,
  TextTransition,
  NumberTransition,
  MorphingSurface,
  ExpandingAction,
  Card,
  Badge,
  type ButtonStatus,
} from "@b4/react";
import { useReducedMotion } from "@b4/motion";

export function MotionLabPage() {
  const reducedMotion = useReducedMotion();

  // Async action state
  const [controlledStatus, setControlledStatus] = useState<ButtonStatus>("idle");
  const [rapidClickCount, setRapidClickCount] = useState(0);

  // Selection state
  const [selectedSegment, setSelectedSegment] = useState("overview");
  const [selectedTab, setSelectedTab] = useState("tab-1");
  const [selectedRadio, setSelectedRadio] = useState("option-1");

  // Morphing state
  const [isMorphed, setIsMorphed] = useState(false);

  // Text transition state
  const textOptions = [
    "Ready",
    "Synchronizing cluster metadata…",
    "Success",
    "Provisioning compute nodes across 3 regions",
    "Done",
  ];
  const [textIndex, setTextIndex] = useState(0);
  const [metricValue, setMetricValue] = useState(1420);

  const PlusIcon = (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" aria-hidden="true">
      <path d="M8 3v10M3 8h10" />
    </svg>
  );

  return (
    <div className="b4-studio-page b4-motion-lab">
      <div className="b4-studio-header">
        <div>
          <h1 className="b4-studio-title">Motion Lab</h1>
          <p className="b4-studio-subtitle">
            Interactive test bench for B4 choreography, spring physics, asynchronous action
            transformations, indicator travel, and interruption safety.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge tone={reducedMotion ? "warning" : "neutral"}>
            Reduced Motion: {reducedMotion ? "ON (instant collapse)" : "OFF (spring active)"}
          </Badge>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        {/* Lab 1: Asynchronous Action Transformations */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Asynchronous Action Choreography
            </h3>
            <Badge tone="neutral">Family A / Motion</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Exercises soft blur/opacity text crossfade, icon substitution (spinner, check, error), smooth
            width adaptation, and automatic lifecycle management.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                Automatic Async Action (click to run 1.5s simulated task)
              </div>
              <Button
                variant="primary"
                onAction={async () => {
                  await new Promise((resolve) => setTimeout(resolve, 1500));
                }}
                statusLabels={{
                  idle: "Deploy to production",
                  pending: "Deploying cluster…",
                  success: "Cluster deployed!",
                  error: "Deployment failed",
                }}
              >
                Deploy to production
              </Button>
            </div>

            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                Simulate Failing Async Action (throws error)
              </div>
              <Button
                variant="destructive"
                onAction={async () => {
                  await new Promise((_, reject) => setTimeout(() => reject(new Error("Network timeout")), 1200));
                }}
                statusLabels={{
                  idle: "Terminate database instance",
                  pending: "Terminating…",
                  success: "Terminated",
                  error: "Failed: Network timeout (Retry)",
                }}
              >
                Terminate database instance
              </Button>
            </div>

            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                Manual Status Driver
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
                {(["idle", "pending", "success", "error"] as ButtonStatus[]).map((st) => (
                  <Button
                    key={st}
                    variant={controlledStatus === st ? "primary" : "secondary"}
                    size="sm"
                    onClick={() => setControlledStatus(st)}
                  >
                    {st}
                  </Button>
                ))}
              </div>
              <div style={{ marginTop: 12 }}>
                <Button
                  variant="secondary"
                  status={controlledStatus}
                  statusLabels={{
                    idle: "Controlled: Idle",
                    pending: "Controlled: Processing…",
                    success: "Controlled: Complete",
                    error: "Controlled: Failed",
                  }}
                >
                  Controlled: Idle
                </Button>
              </div>
            </div>
          </div>
        </Card>

        {/* Lab 2: Indicator Travel & Interruption Safety */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Selection & Indicator Travel
            </h3>
            <Badge tone="neutral">springs.travel</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            The signature Changelog/Login reference interaction: capsule moves behind active label with
            calibrated spring physics without layout shifts.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                SegmentedControl (Capsule travel)
              </div>
              <SegmentedControl
                aria-label="Navigation sections"
                items={[
                  { value: "overview", label: "Overview" },
                  { value: "analytics", label: "Analytics" },
                  { value: "deployments", label: "Deployments" },
                  { value: "settings", label: "Settings" },
                ]}
                value={selectedSegment}
                onValueChange={(val) => {
                  if (val) setSelectedSegment(val);
                }}
              />
            </div>

            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                Rapid Selection Stress Test
              </div>
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => {
                    const keys = ["overview", "analytics", "deployments", "settings"];
                    const next = keys[(keys.indexOf(selectedSegment) + 1) % keys.length] ?? "overview";
                    setSelectedSegment(next);
                    setRapidClickCount((c) => c + 1);
                  }}
                >
                  Quick Cycle (Clicked {rapidClickCount}x)
                </Button>
                <span style={{ fontSize: "var(--b4-text-sm)", color: "var(--b4-text-secondary)" }}>
                  Current: <strong>{selectedSegment}</strong>
                </span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                Tabs Indicator
              </div>
              <Tabs
                aria-label="Environment tabs"
                items={[
                  { value: "tab-1", label: "Build Configuration", content: <p>Build pipeline configuration.</p> },
                  { value: "tab-2", label: "Environment Secrets", content: <p>Encrypted runtime secrets.</p> },
                  { value: "tab-3", label: "Domains & SSL", content: <p>Custom edge domains and TLS certificates.</p> },
                ]}
                value={selectedTab}
                onValueChange={(v) => setSelectedTab(v)}
              />
            </div>

            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                RadioGroup with Animated Capsule
              </div>
              <RadioGroup
                aria-label="Storage disk tier options"
                items={[
                  { value: "option-1", label: "Standard SSD (100 IOPS)" },
                  { value: "option-2", label: "High IOPS NVMe (5,000 IOPS)" },
                  { value: "option-3", label: "Enterprise SAN (Distributed)" },
                ]}
                value={selectedRadio}
                onValueChange={(val) => setSelectedRadio(val)}
              />
            </div>
          </div>
        </Card>

        {/* Lab 3: Variable-Width Text Transitions */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Variable-Width Text Transitions
            </h3>
            <Badge tone="neutral">TextTransition</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Maintains stable vertical baseline alignment and smooth width adaptation across strings of
            differing lengths. Never leaves text blurry at rest.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                display: "inline-flex",
                alignItems: "center",
                padding: "12px 16px",
                background: "var(--b4-surface-raised)",
                borderRadius: "var(--b4-radius-md)",
                border: "1px solid var(--b4-border-subtle)",
              }}
            >
              <span style={{ color: "var(--b4-text-muted)", marginRight: 12, fontSize: "var(--b4-text-xs)" }}>
                STATUS:
              </span>
              <strong style={{ color: "var(--b4-text-primary)" }}>
                <TextTransition value={textOptions[textIndex] ?? "Ready"} mode="crossfade" />
              </strong>
            </div>

            <div>
              <Button
                size="sm"
                variant="secondary"
                onClick={() => setTextIndex((i) => (i + 1) % textOptions.length)}
              >
                Next Text String
              </Button>
            </div>
          </div>
        </Card>

        {/* Lab 4: Rolling Numeric Transitions */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Rolling Number Transitions
            </h3>
            <Badge tone="neutral">NumberTransition</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Direction-aware numeric stepping for telemetry, metrics, request counts, and live pricing.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: "var(--b4-text-3xl)",
                fontWeight: "var(--b4-weight-bold)",
                fontFamily: "var(--b4-font-mono)",
                color: "var(--b4-text-primary)",
              }}
            >
              <NumberTransition value={metricValue} />
              <span style={{ fontSize: "var(--b4-text-sm)", color: "var(--b4-text-muted)", marginLeft: 8 }}>
                req / sec
              </span>
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <Button size="sm" variant="secondary" onClick={() => setMetricValue((v) => v + 1)}>
                +1
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMetricValue((v) => v - 1)}>
                -1
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMetricValue((v) => v + 125)}>
                +125
              </Button>
              <Button size="sm" variant="secondary" onClick={() => setMetricValue((v) => Math.max(0, v - 250))}>
                -250
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setMetricValue(1420)}>
                Reset
              </Button>
            </div>
          </div>
        </Card>

        {/* Lab 5: Morphing Surface & Expanding Action */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Morphing Surfaces & Expanding Actions
            </h3>
            <Badge tone="neutral">springs.settle</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            Smooth dimensional morphing without layout disconnects.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                MorphingSurface (Click to toggle expansion)
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Button size="sm" variant="secondary" onClick={() => setIsMorphed((v) => !v)}>
                  Toggle Morphing Surface
                </Button>
                <MorphingSurface
                  style={{
                    background: "var(--b4-surface-raised)",
                    borderRadius: "var(--b4-radius-md)",
                    border: "1px solid var(--b4-border-subtle)",
                    overflow: "hidden",
                    padding: isMorphed ? 20 : 12,
                    maxWidth: isMorphed ? 480 : 240,
                  }}
                >
                  <div style={{ fontWeight: "var(--b4-weight-medium)" }}>
                    {isMorphed ? "Expanded Security Group Configuration" : "Firewall: Active"}
                  </div>
                  {isMorphed && (
                    <p style={{ margin: "8px 0 0", fontSize: "var(--b4-text-sm)", color: "var(--b4-text-secondary)" }}>
                      Incoming ports 443 (HTTPS), 80 (HTTP), and 22 (SSH with bastion requirement) are enabled.
                    </p>
                  )}
                </MorphingSurface>
              </div>
            </div>

            <div>
              <div style={{ fontSize: "var(--b4-text-xs)", color: "var(--b4-text-muted)", marginBottom: 8 }}>
                ExpandingAction (Hover or focus to expand)
              </div>
              <ExpandingAction
                icon={PlusIcon}
                label="Quick Add Member"
                onClick={() => alert("Expanding action clicked")}
              />
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
