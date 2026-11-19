import { useState, type ReactNode } from "react";
import { Badge, Card, SegmentedControl, Switch } from "@b4/react";
import { RefractionSweep } from "@b4/react/effects";
import type { RefractionSweepAmplitude, RefractionSweepDirection, RefractionSweepTone } from "@b4/react/effects";
import { useReducedMotion } from "@b4/motion";

/**
 * B4 Studio — Effects Lab.
 *
 * `BorderBeam` and `DistortionWave` (a WebGL dual-view transition engine)
 * were removed per an explicit mission-brief decision: B4's priority is
 * one coherent, exceptionally polished component system, not a
 * decorative-effects engine. `RefractionSweep` remains the one first-party
 * opt-in effect (`@b4/react/effects`), small and CSS-based.
 */
export function EffectsLabPage() {
  const reducedMotion = useReducedMotion();

  const [waveActive, setWaveActive] = useState(true);
  const [waveAmplitude, setWaveAmplitude] = useState<RefractionSweepAmplitude>("md");
  const [waveDirection, setWaveDirection] = useState<RefractionSweepDirection>("horizontal");
  const [waveTone, setWaveTone] = useState<RefractionSweepTone>("accent");
  const [waveDuration, setWaveDuration] = useState(6);

  const panel = (
    <>
      <p style={{ margin: 0, fontWeight: "var(--b4-weight-semibold)" }}>Deploy pipeline</p>
      <p style={{ margin: "var(--b4-space-2) 0 0", color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)" }}>
        The effect travels across this surface. The text beneath it genuinely refracts while the wave
        passes, then resolves again.
      </p>
    </>
  );

  return (
    <div className="b4-studio-page b4-effects-lab">
      <div className="b4-studio-header">
        <div>
          <h1 className="b4-studio-title">Effects Lab</h1>
          <p className="b4-studio-subtitle">
            Interactive bench for B4's one first-party effect — decorative, opt-in, and exported
            separately from the core component entry point.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge tone={reducedMotion ? "warning" : "neutral"}>
            Reduced Motion: {reducedMotion ? "ON (effect holds still)" : "OFF (effect animating)"}
          </Badge>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              RefractionSweep
            </h3>
            <Badge tone="neutral">@b4/react/effects</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            A travelling band of refraction. It uses <code>backdrop-filter</code> against the pixels actually
            rendered behind it, so the content genuinely bends — it is not a painted copy of the content.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <Switch checked={waveActive} onCheckedChange={setWaveActive} label="Active" />
            <LabControl label="Amplitude">
              <SegmentedControl
                aria-label="RefractionSweep amplitude"
                size="sm"
                items={[
                  { value: "sm", label: "sm" },
                  { value: "md", label: "md" },
                  { value: "lg", label: "lg" },
                ]}
                value={waveAmplitude}
                onValueChange={(value) => setWaveAmplitude(value as RefractionSweepAmplitude)}
              />
            </LabControl>
            <LabControl label="Direction">
              <SegmentedControl
                aria-label="RefractionSweep direction"
                size="sm"
                items={[
                  { value: "horizontal", label: "horizontal" },
                  { value: "vertical", label: "vertical" },
                ]}
                value={waveDirection}
                onValueChange={(value) => setWaveDirection(value as RefractionSweepDirection)}
              />
            </LabControl>
            <LabControl label="Tone">
              <SegmentedControl
                aria-label="RefractionSweep tone"
                size="sm"
                items={[
                  { value: "accent", label: "accent" },
                  { value: "success", label: "success" },
                  { value: "warning", label: "warning" },
                  { value: "danger", label: "danger" },
                  { value: "info", label: "info" },
                ]}
                value={waveTone}
                onValueChange={(value) => setWaveTone(value as RefractionSweepTone)}
              />
            </LabControl>
            <LabControl label={`Duration: ${waveDuration}s`}>
              <SegmentedControl
                aria-label="RefractionSweep duration"
                size="sm"
                items={[
                  { value: "3", label: "3s" },
                  { value: "6", label: "6s" },
                  { value: "12", label: "12s" },
                ]}
                value={String(waveDuration)}
                onValueChange={(value) => setWaveDuration(Number(value))}
              />
            </LabControl>
          </div>

          <div style={{ maxWidth: 320 }}>
            <RefractionSweep
              active={waveActive}
              amplitude={waveAmplitude}
              direction={waveDirection}
              tone={waveTone}
              duration={waveDuration}
            >
              <Card>{panel}</Card>
            </RefractionSweep>
          </div>
        </Card>
      </div>
    </div>
  );
}

function LabControl({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <span style={{ fontSize: "var(--b4-text-sm)", color: "var(--b4-text-secondary)" }}>{label}</span>
      {children}
    </div>
  );
}
