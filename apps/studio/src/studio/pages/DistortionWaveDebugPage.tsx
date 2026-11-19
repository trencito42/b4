import { useRef, useState } from "react";
import { Badge, Button, Card, PageHeader, SegmentedControl, Slider } from "@b4/react";
import { DistortionWave, captureElement } from "@b4/react/effects";
import type { DistortionWaveType } from "@b4/react/effects";

/**
 * Development verification page for the real DistortionWave engine —
 * NOT a polished showcase. This exists to satisfy the mission brief's
 * explicit acceptance gates before claiming the effect works:
 *
 * Gate 1: visually compare the original/revealed React cards against
 * their captured Canvas2D reconstructions (DomCapture.ts's SVG
 * foreignObject pipeline). If a reconstruction is visibly wrong, that's
 * a capture bug, not a shader bug.
 *
 * Gate 2: scrub progress manually and inspect a mid-transition frame
 * (e.g. 0.45) for real displaced geometry + chromatic separation, not
 * just a blur band or flat color overlay.
 */
export function DistortionWaveDebugPage() {
  const [revealed, setRevealed] = useState(false);
  const [type, setType] = useState<DistortionWaveType>("vertical");
  const [scrubProgress, setScrubProgress] = useState(0);
  const [scrubbing, setScrubbing] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  const [captureStatus, setCaptureStatus] = useState<"idle" | "running" | "done" | "error">("idle");
  const [captureError, setCaptureError] = useState<string | null>(null);
  const originalProbeRef = useRef<HTMLDivElement>(null);
  const revealedProbeRef = useRef<HTMLDivElement>(null);
  const originalResultRef = useRef<HTMLDivElement>(null);
  const revealedResultRef = useRef<HTMLDivElement>(null);

  // Displays the captured <canvas> elements directly (appended to the
  // DOM) rather than via canvas.toDataURL(): the SVG foreignObject
  // pipeline marks the canvas "tainted" for pixel readback (a real,
  // documented browser security restriction on foreignObject-rasterized
  // images -- see docs/effects/DISTORTION_WAVE.md's known-limitations
  // section), which blocks toDataURL()/getImageData() specifically but
  // does NOT block drawing or displaying the canvas, and does NOT block
  // uploading it as a WebGL texture for on-screen rendering (only
  // WebGL's readPixels would be blocked, which this effect never calls).
  async function runCaptureGate() {
    setCaptureStatus("running");
    setCaptureError(null);
    try {
      if (originalProbeRef.current && originalResultRef.current) {
        const result = await captureElement(originalProbeRef.current);
        originalResultRef.current.replaceChildren(result.canvas);
      }
      if (revealedProbeRef.current && revealedResultRef.current) {
        const result = await captureElement(revealedProbeRef.current);
        revealedResultRef.current.replaceChildren(result.canvas);
      }
      setCaptureStatus("done");
    } catch (error) {
      setCaptureStatus("error");
      setCaptureError(error instanceof Error ? error.message : String(error));
    }
  }

  return (
    <div>
      <PageHeader
        title="DistortionWave — Capture & Shader Debug"
        description="Development verification only (brief acceptance gates 1 & 2) — not the polished demo. Confirms DOM capture fidelity and real mid-transition shader output before trusting the effect."
      />

      <div style={{ marginTop: "var(--b4-space-8)", display: "flex", flexDirection: "column", gap: "var(--b4-space-10)" }}>
        <section>
          <h3 style={{ marginBottom: "var(--b4-space-4)" }}>Gate 1 — DOM capture fidelity</h3>
          <Button size="sm" variant="secondary" onClick={() => void runCaptureGate()}>
            Run capture
          </Button>
          <span style={{ marginLeft: "var(--b4-space-4)", fontSize: "0.8125rem", color: "var(--b4-text-secondary)" }}>
            Status: {captureStatus}
            {captureError ? ` — ${captureError}` : ""}
          </span>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--b4-space-6)", marginTop: "var(--b4-space-6)" }}>
            <div>
              <p style={{ fontSize: "0.8125rem", color: "var(--b4-text-secondary)" }}>Original (live React)</p>
              <div ref={originalProbeRef} style={{ display: "inline-block" }}>
                <Card variant="raised" padding="lg" style={{ width: 280 }}>
                  <Badge tone="accent">Review</Badge>
                  <h4 style={{ margin: "var(--b4-space-4) 0" }}>$1,250.00</h4>
                  <p style={{ color: "var(--b4-text-secondary)", fontSize: "0.875rem" }}>To Maya Chen · Studio rent</p>
                </Card>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--b4-text-secondary)", marginTop: "var(--b4-space-3)" }}>Captured reconstruction</p>
              <div
                ref={originalResultRef}
                style={{ width: 280, minHeight: 120, border: "1px dashed var(--b4-border-subtle)" }}
              />
            </div>
            <div>
              <p style={{ fontSize: "0.8125rem", color: "var(--b4-text-secondary)" }}>Revealed (live React)</p>
              <div ref={revealedProbeRef} style={{ display: "inline-block" }}>
                <Card variant="raised" padding="lg" style={{ width: 280 }}>
                  <Badge tone="success">Sent</Badge>
                  <h4 style={{ margin: "var(--b4-space-4) 0" }}>$1,250.00</h4>
                  <p style={{ color: "var(--b4-text-secondary)", fontSize: "0.875rem" }}>Payment complete</p>
                </Card>
              </div>
              <p style={{ fontSize: "0.8125rem", color: "var(--b4-text-secondary)", marginTop: "var(--b4-space-3)" }}>Captured reconstruction</p>
              <div
                ref={revealedResultRef}
                style={{ width: 280, minHeight: 120, border: "1px dashed var(--b4-border-subtle)" }}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ marginBottom: "var(--b4-space-4)" }}>Gate 2 — scrub the real shader</h3>
          <div style={{ display: "flex", gap: "var(--b4-space-6)", alignItems: "center", marginBottom: "var(--b4-space-4)" }}>
            <SegmentedControl<DistortionWaveType>
              aria-label="Wave type"
              size="sm"
              items={[
                { value: "vertical", label: "vertical" },
                { value: "horizontal", label: "horizontal" },
                { value: "center", label: "center" },
              ]}
              value={type}
              onValueChange={setType}
            />
            <Button size="sm" variant="ghost" onClick={() => setScrubbing((v) => !v)}>
              {scrubbing ? "Stop scrubbing" : "Start scrubbing"}
            </Button>
          </div>
          {scrubbing && (
            <div style={{ maxWidth: 280, marginBottom: "var(--b4-space-6)" }}>
              <Slider
                label={`Progress: ${scrubProgress.toFixed(2)}`}
                min={0}
                max={1}
                step={0.01}
                value={scrubProgress}
                onValueChange={(v) => setScrubProgress(v as number)}
              />
            </div>
          )}

          <DistortionWave
            revealed={revealed}
            type={type}
            source={confirmRef}
            palette="colorful"
            scrub={scrubbing}
            progress={scrubbing ? scrubProgress : undefined}
            revealedContent={
              <Card variant="raised" padding="lg" style={{ width: 320 }}>
                <Badge tone="success">Sent</Badge>
                <h4 style={{ margin: "var(--b4-space-4) 0" }}>$1,250.00</h4>
                <p style={{ color: "var(--b4-text-secondary)", fontSize: "0.875rem" }}>Payment complete</p>
              </Card>
            }
            overlay={
              !scrubbing && (
                <Button ref={confirmRef} variant="primary" onClick={() => setRevealed((v) => !v)} style={{ marginTop: "var(--b4-space-6)" }}>
                  {revealed ? "Reset" : "Confirm"}
                </Button>
              )
            }
          >
            <Card variant="raised" padding="lg" style={{ width: 320 }}>
              <Badge tone="accent">Review</Badge>
              <h4 style={{ margin: "var(--b4-space-4) 0" }}>$1,250.00</h4>
              <p style={{ color: "var(--b4-text-secondary)", fontSize: "0.875rem" }}>To Maya Chen · Studio rent</p>
            </Card>
          </DistortionWave>
        </section>
      </div>
    </div>
  );
}
