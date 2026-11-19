/**
 * Deterministic progress/lifecycle driver for one DistortionWave
 * transition. Owns `requestAnimationFrame` scheduling only — it knows
 * nothing about React, WebGL or DOM capture; it just turns elapsed time
 * into a 0..1 progress value and calls back on every tick plus on
 * lifecycle events, so the geometry/renderer/React layers can stay
 * independently testable (per the mission brief's explicit "no chains of
 * setTimeout" and "deterministic progress" requirements).
 */

export type WaveLifecyclePhase = "idle" | "anticipation" | "traveling" | "settling" | "done";

export interface WaveControllerOptions {
  /** Seconds for the main travel phase. */
  duration: number;
  /** Seconds of "pull toward the source" before the front launches. */
  anticipationDuration?: number;
  /** Seconds of residual light/hairline fade after the front clears. */
  settleDuration?: number;
  onTick: (progress: number, phase: WaveLifecyclePhase) => void;
  onPhaseChange?: (phase: WaveLifecyclePhase) => void;
  onFinish?: (direction: "forward" | "reverse") => void;
}

export interface WaveController {
  play: () => void;
  reverse: () => void;
  /** Cancel any in-flight animation and jump straight to 0 or 1. */
  reset: (toProgress: 0 | 1) => void;
  /** Directly set progress (scrub mode) — cancels any running animation. */
  setProgress: (progress: number) => void;
  dispose: () => void;
  getProgress: () => number;
  getPhase: () => WaveLifecyclePhase;
}

export function createWaveController(options: WaveControllerOptions): WaveController {
  const anticipation = options.anticipationDuration ?? 0.12;
  const settle = options.settleDuration ?? 0.25;
  const totalDuration = anticipation + options.duration + settle;

  let progress = 0;
  let phase: WaveLifecyclePhase = "idle";
  let rafId: number | null = null;
  let startTime = 0;
  let startProgress = 0;

  function setPhase(next: WaveLifecyclePhase) {
    if (phase === next) return;
    phase = next;
    options.onPhaseChange?.(next);
  }

  function phaseForElapsedFraction(f: number): WaveLifecyclePhase {
    const anticipationFraction = anticipation / totalDuration;
    const settleFraction = settle / totalDuration;
    if (f < anticipationFraction) return "anticipation";
    if (f > 1 - settleFraction) return "settling";
    return "traveling";
  }

  function stopLoop() {
    if (rafId !== null) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function runTo(targetProgress: 0 | 1, dir: "forward" | "reverse") {
    stopLoop();
    startTime = performance.now();
    startProgress = progress;
    setPhase(startProgress === targetProgress ? "done" : dir === "forward" ? "anticipation" : "traveling");

    const distance = Math.abs(targetProgress - startProgress);
    const effectiveDuration = totalDuration * Math.max(distance, 0.0001);

    function tick(now: number) {
      const elapsedSeconds = (now - startTime) / 1000;
      const f = effectiveDuration > 0 ? Math.min(1, elapsedSeconds / effectiveDuration) : 1;
      progress = startProgress + (targetProgress - startProgress) * f;
      setPhase(f >= 1 ? "done" : phaseForElapsedFraction(dir === "forward" ? f : 1 - f));
      options.onTick(progress, phase);

      if (f < 1) {
        rafId = requestAnimationFrame(tick);
      } else {
        rafId = null;
        progress = targetProgress;
        setPhase("done");
        options.onTick(progress, phase);
        options.onFinish?.(dir);
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  return {
    play: () => runTo(1, "forward"),
    reverse: () => runTo(0, "reverse"),
    reset: (toProgress) => {
      stopLoop();
      progress = toProgress;
      setPhase("idle");
      options.onTick(progress, phase);
    },
    setProgress: (next) => {
      stopLoop();
      progress = Math.max(0, Math.min(1, next));
      setPhase(progress <= 0 || progress >= 1 ? "idle" : "traveling");
      options.onTick(progress, phase);
    },
    dispose: () => {
      stopLoop();
    },
    getProgress: () => progress,
    getPhase: () => phase,
  };
}
