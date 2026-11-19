import { useEffect, useRef } from "react";
import { createCrestRenderer } from "./crest.js";

const amplitudeToStrength: Record<"sm" | "md" | "lg", number> = {
  sm: 0.5,
  md: 1,
  lg: 1.6,
};

export interface DistortionWaveCrestProps {
  moving: boolean;
  vertical: boolean;
  duration: number;
  amplitude: "sm" | "md" | "lg";
  /** The resolved CSS color (e.g. `var(--b4-accent-text)`) to sample as the shader's uColor. */
  toneVar: string;
}

function parseRgb(computed: string): [number, number, number] {
  const match = /rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)/.exec(computed);
  if (!match) return [1, 1, 1];
  return [Number(match[1]) / 255, Number(match[2]) / 255, Number(match[3]) / 255];
}

/**
 * The canvas that hosts DistortionWave's WebGL2-rendered crest. See
 * crest.ts for the shader and GL lifecycle; this component owns the
 * React side: sizing (ResizeObserver), the animation loop (only runs
 * while `moving`), sampling the crest's actual color from the CSS custom
 * property it's given (so it stays correct across theme switches), and
 * WebGL context-loss/restoration.
 *
 * Renders nothing (an empty, fully transparent canvas) when WebGL2 is
 * unavailable or the context is lost — the real optical distortion
 * (DistortionWave's `backdrop-filter` band) still works without this
 * layer, so losing the crest is a graceful degradation, not a crash.
 */
export function DistortionWaveCrest({ moving, vertical, duration, amplitude, toneVar }: DistortionWaveCrestProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rendererRef = useRef<ReturnType<typeof createCrestRenderer>>(null);
  const colorRef = useRef<[number, number, number]>([1, 1, 1]);
  const rafRef = useRef<number | null>(null);
  const startRef = useRef<number>(0);

  // (Re)sample the resolved color whenever the requested tone changes,
  // and once more via a MutationObserver on <html> so a live theme/
  // contrast toggle (e.g. B4 Studio's own theme switcher) updates the
  // shader's color without needing DistortionWave to remount.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.style.color = toneVar;

    const sample = () => {
      colorRef.current = parseRgb(getComputedStyle(canvas).color);
    };
    sample();

    const root = document.documentElement;
    const observer = new MutationObserver(sample);
    observer.observe(root, { attributes: true, attributeFilter: ["data-b4-theme", "data-b4-contrast"] });
    return () => observer.disconnect();
  }, [toneVar]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    rendererRef.current = createCrestRenderer(canvas);

    const onLost = (event: Event) => {
      event.preventDefault();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      rendererRef.current = null;
    };
    const onRestored = () => {
      rendererRef.current = createCrestRenderer(canvas);
    };
    canvas.addEventListener("webglcontextlost", onLost);
    canvas.addEventListener("webglcontextrestored", onRestored);

    let observer: ResizeObserver | undefined;
    if (typeof ResizeObserver !== "undefined") {
      observer = new ResizeObserver(([entry]) => {
        if (!entry || !rendererRef.current) return;
        const dpr = typeof window !== "undefined" ? Math.min(window.devicePixelRatio || 1, 2) : 1;
        const { width, height } = entry.contentRect;
        rendererRef.current.resize(Math.max(1, Math.round(width * dpr)), Math.max(1, Math.round(height * dpr)));
      });
      observer.observe(canvas);
    }

    return () => {
      canvas.removeEventListener("webglcontextlost", onLost);
      canvas.removeEventListener("webglcontextrestored", onRestored);
      observer?.disconnect();
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      rendererRef.current?.dispose();
      rendererRef.current = null;
    };
  }, []);

  useEffect(() => {
    const renderer = rendererRef.current;
    if (!moving || !renderer) {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
      // A single static frame (t=0) instead of leaving the canvas blank
      // or frozen mid-shimmer — the same "calm, still sheen" the band's
      // own reduced-motion/static state promises, applied to the crest.
      renderer?.render(0, amplitudeToStrength[amplitude], vertical, colorRef.current);
      return;
    }

    startRef.current = performance.now();
    const strength = amplitudeToStrength[amplitude];

    const tick = (now: number) => {
      const elapsedSeconds = (now - startRef.current) / 1000;
      rendererRef.current?.render(elapsedSeconds, strength, vertical, colorRef.current);
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    };
    // `duration` isn't read inside the loop (the shader's own time-based
    // shimmer doesn't need to match the CSS sweep's period exactly — only
    // the backdrop-filter band's position does, and that's CSS-driven),
    // but it's listed so a duration change restarts the loop cleanly
    // alongside the CSS animation it rides with.
  }, [moving, vertical, amplitude, duration]);

  return (
    <canvas
      ref={canvasRef}
      className="b4-distortion-wave__crest"
      aria-hidden="true"
    />
  );
}
