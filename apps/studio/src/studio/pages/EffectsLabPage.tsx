import { useRef, useState, type ReactNode } from "react";
import { Badge, Button, Card, SegmentedControl, Switch } from "@b4/react";
import { BorderBeam, DistortionWave, RefractionSweep } from "@b4/react/effects";
import type { BorderBeamSize, BorderBeamTone } from "@b4/react/effects";
import type { RefractionSweepAmplitude, RefractionSweepDirection, RefractionSweepTone } from "@b4/react/effects";
import type { DistortionWaveType } from "@b4/react/effects";
import { useReducedMotion } from "@b4/motion";

/**
 * B4 Studio — Effects Lab.
 *
 * The effects live in their own export subpath (`@b4/react/effects`) so a
 * consumer that never uses them pays no bundle cost. This page is the
 * interactive bench for them: every variant prop is exposed as a live
 * control so the effect can be judged in both themes, at every density,
 * and with reduced motion switched on or off — not just read about.
 */
export function EffectsLabPage() {
  const reducedMotion = useReducedMotion();

  const [beamActive, setBeamActive] = useState(true);
  const [beamSize, setBeamSize] = useState<BorderBeamSize>("md");
  const [beamTone, setBeamTone] = useState<BorderBeamTone>("accent");
  const [beamDuration, setBeamDuration] = useState(6);

  const [waveActive, setWaveActive] = useState(true);
  const [waveAmplitude, setWaveAmplitude] = useState<RefractionSweepAmplitude>("md");
  const [waveDirection, setWaveDirection] = useState<RefractionSweepDirection>("horizontal");
  const [waveTone, setWaveTone] = useState<RefractionSweepTone>("accent");
  const [waveDuration, setWaveDuration] = useState(6);

  const [distortionSent, setDistortionSent] = useState(false);
  const [distortionType, setDistortionType] = useState<DistortionWaveType>("vertical");
  const distortionConfirmRef = useRef<HTMLButtonElement>(null);

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
            Interactive bench for B4's first-party effects. Both are decorative, opt-in, and exported
            separately from the core component entry point.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <Badge tone={reducedMotion ? "warning" : "neutral"}>
            Reduced Motion: {reducedMotion ? "ON (effects hold still)" : "OFF (effects animating)"}
          </Badge>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(420px, 1fr))", gap: 24 }}>
        {/* Lab 1 — BorderBeam */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              BorderBeam
            </h3>
            <Badge tone="neutral">@b4/react/effects</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            A masked, rotating conic gradient that traces the child&rsquo;s real rounded perimeter — not a
            rectangular clip box laid over the surface.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <Switch checked={beamActive} onCheckedChange={setBeamActive} label="Active" />
            <LabControl label="Size">
              <SegmentedControl
                aria-label="BorderBeam size"
                size="sm"
                items={[
                  { value: "sm", label: "sm" },
                  { value: "md", label: "md" },
                  { value: "lg", label: "lg" },
                ]}
                value={beamSize}
                onValueChange={(value) => setBeamSize(value as BorderBeamSize)}
              />
            </LabControl>
            <LabControl label="Tone">
              <SegmentedControl
                aria-label="BorderBeam tone"
                size="sm"
                items={[
                  { value: "accent", label: "accent" },
                  { value: "success", label: "success" },
                  { value: "warning", label: "warning" },
                  { value: "danger", label: "danger" },
                  { value: "info", label: "info" },
                  { value: "aurora", label: "aurora" },
                ]}
                value={beamTone}
                onValueChange={(value) => setBeamTone(value as BorderBeamTone)}
              />
            </LabControl>
            <LabControl label={`Duration: ${beamDuration}s`}>
              <SegmentedControl
                aria-label="BorderBeam duration"
                size="sm"
                items={[
                  { value: "3", label: "3s" },
                  { value: "6", label: "6s" },
                  { value: "12", label: "12s" },
                ]}
                value={String(beamDuration)}
                onValueChange={(value) => setBeamDuration(Number(value))}
              />
            </LabControl>
          </div>

          <div style={{ maxWidth: 320 }}>
            <BorderBeam active={beamActive} size={beamSize} tone={beamTone} duration={beamDuration}>
              <Card>{panel}</Card>
            </BorderBeam>
          </div>
        </Card>

        {/* Lab 2 — RefractionSweep */}
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

        {/* Lab 3 — DistortionWave */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              DistortionWave
            </h3>
            <Badge tone="neutral">@b4/react/effects</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            A real WebGL2 dual-view transition: both React states are captured to canvas, uploaded as GPU
            textures, and a fragment shader displaces the UV coordinates it samples them through along a
            travelling wavefront — genuine per-pixel geometric distortion, not a CSS filter.
          </p>

          <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 20 }}>
            <LabControl label="Geometry">
              <SegmentedControl
                aria-label="DistortionWave geometry"
                size="sm"
                items={[
                  { value: "vertical", label: "vertical" },
                  { value: "horizontal", label: "horizontal" },
                  { value: "center", label: "center" },
                ]}
                value={distortionType}
                onValueChange={(value) => {
                  if (value) setDistortionType(value as DistortionWaveType);
                }}
              />
            </LabControl>
          </div>

          <div style={{ maxWidth: 320 }}>
            <DistortionWave
              key={distortionType}
              revealed={distortionSent}
              source={distortionConfirmRef}
              type={distortionType}
              palette="colorful"
              cornerRadius="var(--b4-surface-radius)"
              overlay={
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    display: "flex",
                    alignItems: "flex-end",
                    justifyContent: "flex-end",
                    padding: 16,
                  }}
                >
                  {distortionSent ? (
                    <Button variant="secondary" size="sm" onClick={() => setDistortionSent(false)}>
                      Reset
                    </Button>
                  ) : (
                    <Button ref={distortionConfirmRef} variant="primary" size="sm" onClick={() => setDistortionSent(true)}>
                      Confirm
                    </Button>
                  )}
                </div>
              }
              revealedContent={
                <Card variant="raised" padding="lg">
                  <Badge tone="success">Sent</Badge>
                  <h4 style={{ margin: "8px 0 4px", fontSize: "var(--b4-text-lg)" }}>$1,250.00</h4>
                  <p style={{ margin: 0, color: "var(--b4-text-secondary)" }}>Payment complete</p>
                </Card>
              }
            >
              <Card variant="raised" padding="lg">
                <Badge tone="accent">Review</Badge>
                <h4 style={{ margin: "8px 0 4px", fontSize: "var(--b4-text-lg)" }}>$1,250.00</h4>
                <p style={{ margin: 0, color: "var(--b4-text-secondary)" }}>To Maya Chen · Studio rent</p>
              </Card>
            </DistortionWave>
          </div>
        </Card>

        {/* Lab 4 — both together */}
        <Card variant="outlined" padding="lg">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h3 style={{ margin: 0, fontSize: "var(--b4-text-lg)", fontWeight: "var(--b4-weight-semibold)" }}>
              Composed
            </h3>
            <Badge tone="neutral">Edge + Face</Badge>
          </div>
          <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)", marginBottom: 16 }}>
            The two effects are independent layers: BorderBeam traces the perimeter, RefractionSweep crosses
            the face. They compose without either one owning the other&rsquo;s geometry.
          </p>

          <div style={{ maxWidth: 320 }}>
            <BorderBeam active={beamActive} size={beamSize} tone={beamTone} duration={beamDuration}>
              <RefractionSweep
                active={waveActive}
                amplitude={waveAmplitude}
                direction={waveDirection}
                tone={waveTone}
                duration={waveDuration}
              >
                <Card>{panel}</Card>
              </RefractionSweep>
            </BorderBeam>
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
