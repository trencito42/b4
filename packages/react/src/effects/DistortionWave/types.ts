import type { ReactNode, RefObject } from "react";

/** The wavefront's geometry. See `internal/WaveGeometry.ts` for the model each one implements. */
export type DistortionWaveType = "vertical" | "horizontal" | "center";

/**
 * Color presets for the wavefront's chromatic edge. Each maps to EXISTING
 * B4 semantic tokens (via `internal/WaveShaders.ts`'s palette resolver),
 * never a hardcoded hex — "colorful" blends three tokens the way
 * `BorderBeam`'s `tone="aurora"` halo does.
 */
export type DistortionWavePalette = "colorful" | "mono" | "ocean" | "sunset";

/** A measurable source: a ref to the triggering element, the element itself, or an explicit rect. */
export type DistortionWaveSource =
  | RefObject<HTMLElement | null>
  | HTMLElement
  | DOMRect
  | { x: number; y: number; width: number; height: number };

export interface DistortionWaveHandle {
  /** Play the transition forward (toward `revealed`). */
  play: () => void;
  /** Play the transition backward (toward the original view), regardless of `revealed`. */
  reverse: () => void;
  /** Cancel any in-flight transition and snap to the current `revealed` state instantly. */
  reset: () => void;
  /** Capture both views and warm the GPU pipeline ahead of time, without starting a transition. */
  prepare: () => Promise<void>;
}

export interface DistortionWaveProps {
  /** The original view, shown when `revealed` is false. */
  children: ReactNode;
  /** The revealed view, shown when `revealed` is true. */
  revealedContent: ReactNode;
  /** Which view is the target state. Toggling it plays the transition. */
  revealed: boolean;
  /**
   * Content that stays on top of both captured views and the GPU overlay
   * at all times: never captured into a snapshot, never distorted, never
   * blurred, always interactive (e.g. the button that triggers the
   * transition). Typically renders the control that flips `revealed`.
   */
  overlay?: ReactNode;
  /**
   * Where the wave originates. A ref/element is measured relative to this
   * component's own container; an explicit rect is used as-is. Required
   * for the wave to originate at a real point rather than the card's
   * center — pass the same ref used by the control inside `overlay`.
   */
  source?: DistortionWaveSource;
  /** Overrides the focus point the wave curves around. Defaults to the source's own center. */
  focus?: { x: number; y: number };
  /** Wavefront geometry. @default "vertical" */
  type?: DistortionWaveType;
  /** Chromatic edge color preset. @default "colorful" */
  palette?: DistortionWavePalette;
  /** Overall strength of the lens/chromatic effect, 0–1. @default 1 */
  scale?: number;
  /** Corner radius the capture/overlay are clipped to. Defaults to `--b4-surface-radius`. */
  cornerRadius?: string;
  /** Seconds for a full forward travel. @default 0.9 */
  duration?: number;
  /** When true, exposes `progress` as a controlled 0–1 value instead of animating on a timer (for scrubbing/debug UIs). */
  scrub?: boolean;
  /** Controlled progress value, used only when `scrub` is true. */
  progress?: number;
  /** Custom capture function, overriding the built-in DOM-to-canvas pipeline. */
  capture?: (el: HTMLElement) => Promise<HTMLCanvasElement>;
  /** Re-capture the active view when it changes while not transitioning. @default false */
  live?: boolean;
  /** Pre-capture both views as soon as this component mounts, before any interaction. @default false */
  prewarm?: boolean;
  /** Backing-store resolution multiplier for the WebGL canvas, capped internally. @default min(devicePixelRatio, 2) */
  resolution?: number;
  /** Forces the reduced-motion (instant crossfade, no GPU wave) path regardless of the OS setting. */
  reducedMotion?: boolean;
  /** Called once a forward or reverse transition completes. */
  onFinish?: (direction: "forward" | "reverse") => void;
  className?: string;
}
