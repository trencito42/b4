import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { useReducedMotion } from "@b4/motion";
import { captureElement } from "./internal/DomCapture.js";
import { computeWaveGeometry } from "./internal/WaveGeometry.js";
import { createWaveRenderer, type WaveRenderer } from "./internal/WaveRenderer.js";
import { resolvePalette } from "./internal/WaveShaders.js";
import { createWaveController, type WaveController } from "./internal/WaveController.js";
import type { DistortionWaveHandle, DistortionWaveProps, DistortionWaveSource } from "./types.js";

function resolveSourceRect(source: DistortionWaveSource | undefined, containerEl: HTMLElement | null): { x: number; y: number; width: number; height: number } | null {
  if (!source || !containerEl) return null;
  const containerRect = containerEl.getBoundingClientRect();

  let el: HTMLElement | null = null;
  if (source instanceof HTMLElement) {
    el = source;
  } else if ("current" in source) {
    el = source.current;
  } else if ("width" in source && !("current" in source)) {
    // Either a DOMRect or the explicit {x,y,width,height} shape — both
    // match this branch; DOMRect also has x/y getters.
    const rect = source as DOMRect | { x: number; y: number; width: number; height: number };
    return { x: rect.x, y: rect.y, width: rect.width, height: rect.height };
  }
  if (!el) return null;
  const rect = el.getBoundingClientRect();
  return {
    x: rect.left - containerRect.left,
    y: rect.top - containerRect.top,
    width: rect.width,
    height: rect.height,
  };
}

/**
 * B4's dual-React-view transition engine: a real WebGL2 pipeline that
 * captures both the current and target view as textures, then displaces
 * the UV coordinates it samples them through along a travelling
 * wavefront — genuine per-pixel geometric distortion, not a CSS filter.
 * See docs/effects/DISTORTION_WAVE.md for the full architecture, and
 * docs/effects/REFRACTION_SWEEP.md for the smaller, CSS-based single-
 * surface sibling this component is NOT (that one kept the old name).
 *
 * Both `children` (the original view) and `revealedContent` (the target
 * view) are always mounted, stacked in the same box. Whichever one
 * doesn't match the current `revealed` prop is `inert` + `aria-hidden` +
 * non-interactive immediately — real DOM/accessibility state always
 * matches `revealed` right away, never gated behind the animation. The
 * WebGL canvas overlay is a purely decorative, `aria-hidden`,
 * `pointer-events: none` layer on top that plays the visual transition;
 * `overlay` (e.g. the Confirm button) renders in its own always-on-top,
 * always-interactive layer that the shader never touches.
 */
export const DistortionWave = forwardRef<DistortionWaveHandle, DistortionWaveProps>(function DistortionWave(
  {
    children,
    revealedContent,
    revealed,
    overlay,
    source,
    focus,
    type = "vertical",
    palette = "colorful",
    scale = 1,
    cornerRadius = "var(--b4-surface-radius)",
    duration = 0.9,
    scrub = false,
    progress: controlledProgress,
    capture,
    live = false,
    prewarm = false,
    resolution,
    reducedMotion: reducedMotionProp,
    onFinish,
    className,
  },
  forwardedRef,
) {
  const systemReducedMotion = useReducedMotion();
  const reducedMotion = reducedMotionProp ?? systemReducedMotion;

  const containerRef = useRef<HTMLDivElement | null>(null);
  const originalHostRef = useRef<HTMLDivElement | null>(null);
  const revealedHostRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const probeRef = useRef<HTMLDivElement | null>(null);

  const rendererRef = useRef<WaveRenderer | null>(null);
  const controllerRef = useRef<WaveController | null>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const revealedCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const activeTransitionRef = useRef(false);

  const [glAvailable, setGlAvailable] = useState(true);
  const [canvasVisible, setCanvasVisible] = useState(false);
  const [captureFailed, setCaptureFailed] = useState(false);

  const doCapture = useCallback(
    async (el: HTMLElement | null): Promise<HTMLCanvasElement | null> => {
      if (!el) return null;
      try {
        if (capture) return await capture(el);
        const result = await captureElement(el, { resolution });
        return result.canvas;
      } catch {
        setCaptureFailed(true);
        return null;
      }
    },
    [capture, resolution],
  );

  const runTransition = useCallback(
    async (direction: "forward" | "reverse") => {
      const container = containerRef.current;
      const canvas = canvasRef.current;
      if (!container || !canvas) return;

      if (reducedMotion || !glAvailable) {
        // No GPU wave: the real DOM swap (driven by `revealed` below)
        // already happened; just report completion immediately.
        onFinish?.(direction);
        return;
      }

      if (!rendererRef.current) {
        rendererRef.current = createWaveRenderer(canvas);
        if (!rendererRef.current) {
          setGlAvailable(false);
          onFinish?.(direction);
          return;
        }
      }
      const renderer = rendererRef.current;

      const dpr = Math.min(resolution ?? (window.devicePixelRatio || 1), 2);
      const rect = container.getBoundingClientRect();
      renderer.resize(Math.max(1, Math.round(rect.width * dpr)), Math.max(1, Math.round(rect.height * dpr)));

      const [originalCanvas, revealedCanvas] = await Promise.all([
        doCapture(originalHostRef.current),
        doCapture(revealedHostRef.current),
      ]);
      originalCanvasRef.current = originalCanvas;
      revealedCanvasRef.current = revealedCanvas;
      renderer.setOriginalTexture(originalCanvas);
      renderer.setRevealedTexture(revealedCanvas);

      const probeEl = probeRef.current;
      const [colorA, colorB] = probeEl ? resolvePalette(palette, probeEl) : [[1, 1, 1] as [number, number, number], [1, 1, 1] as [number, number, number]];

      const sourceRect = resolveSourceRect(source, container) ?? {
        x: rect.width / 2 - 1,
        y: rect.height - 1,
        width: 2,
        height: 2,
      };
      const containerSize = { width: rect.width, height: rect.height };

      activeTransitionRef.current = true;
      setCanvasVisible(true);

      controllerRef.current?.dispose();
      controllerRef.current = createWaveController({
        duration,
        onTick: (p) => {
          const geometry = computeWaveGeometry({
            type,
            progress: p,
            sourceRect,
            containerSize,
            focus,
          });
          renderer.render({
            geometry,
            lensWidth: 0.14,
            amplitude: 0.06 * scale,
            chromaStrength: 0.8 * scale,
            blurStrength: scale,
            colorA,
            colorB,
            particleSeed: performance.now(),
            containerWidth: rect.width,
            containerHeight: rect.height,
          });
        },
        onFinish: (dir) => {
          activeTransitionRef.current = false;
          setCanvasVisible(false);
          onFinish?.(dir);
        },
      });

      if (direction === "forward") controllerRef.current.play();
      else controllerRef.current.reverse();
    },
    [capture, doCapture, duration, focus, glAvailable, onFinish, palette, reducedMotion, resolution, scale, source, type],
  );

  const prevRevealedRef = useRef(revealed);
  useEffect(() => {
    if (prevRevealedRef.current !== revealed) {
      prevRevealedRef.current = revealed;
      if (!scrub) {
        void runTransition(revealed ? "forward" : "reverse");
      }
    }
  }, [revealed, runTransition, scrub]);

  const scrubReadyRef = useRef(false);
  useEffect(() => {
    if (!scrub || controlledProgress === undefined || reducedMotion) return;
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    let cancelled = false;

    async function renderScrubFrame() {
      if (!container || !canvas) return;
      if (!rendererRef.current) {
        rendererRef.current = createWaveRenderer(canvas);
        if (!rendererRef.current) {
          setGlAvailable(false);
          return;
        }
      }
      const renderer = rendererRef.current;
      if (!scrubReadyRef.current) {
        const dpr = Math.min(resolution ?? (window.devicePixelRatio || 1), 2);
        const rect0 = container.getBoundingClientRect();
        renderer.resize(Math.max(1, Math.round(rect0.width * dpr)), Math.max(1, Math.round(rect0.height * dpr)));
        const [originalCanvas, revealedCanvas] = await Promise.all([
          doCapture(originalHostRef.current),
          doCapture(revealedHostRef.current),
        ]);
        if (cancelled) return;
        renderer.setOriginalTexture(originalCanvas);
        renderer.setRevealedTexture(revealedCanvas);
        scrubReadyRef.current = true;
      }

      const rect = container.getBoundingClientRect();
      const sourceRect = resolveSourceRect(source, container) ?? { x: rect.width / 2, y: rect.height, width: 2, height: 2 };
      const geometry = computeWaveGeometry({
        type,
        progress: controlledProgress as number,
        sourceRect,
        containerSize: { width: rect.width, height: rect.height },
        focus,
      });
      const probeEl = probeRef.current;
      const [colorA, colorB] = probeEl
        ? resolvePalette(palette, probeEl)
        : [[1, 1, 1] as [number, number, number], [1, 1, 1] as [number, number, number]];
      setCanvasVisible(true);
      renderer.render({
        geometry,
        lensWidth: 0.14,
        amplitude: 0.06 * scale,
        chromaStrength: 0.8 * scale,
        blurStrength: scale,
        colorA,
        colorB,
        particleSeed: performance.now(),
        containerWidth: rect.width,
        containerHeight: rect.height,
      });
    }

    void renderScrubFrame();
    return () => {
      cancelled = true;
    };
  }, [controlledProgress, scrub, source, type, focus, scale, palette, doCapture, resolution, reducedMotion]);

  useEffect(() => {
    if (prewarm) {
      void doCapture(originalHostRef.current);
      void doCapture(revealedHostRef.current);
    }
  }, [prewarm, doCapture]);

  useEffect(() => {
    if (!live || activeTransitionRef.current) return;
    const target = revealed ? revealedHostRef.current : originalHostRef.current;
    void doCapture(target);
  }, [live, revealed, doCapture]);

  useEffect(() => {
    return () => {
      controllerRef.current?.dispose();
      rendererRef.current?.dispose();
    };
  }, []);

  useImperativeHandle(
    forwardedRef,
    (): DistortionWaveHandle => ({
      play: () => void runTransition("forward"),
      reverse: () => void runTransition("reverse"),
      reset: () => {
        controllerRef.current?.dispose();
        setCanvasVisible(false);
        activeTransitionRef.current = false;
      },
      prepare: async () => {
        await Promise.all([doCapture(originalHostRef.current), doCapture(revealedHostRef.current)]);
      },
    }),
    [runTransition, doCapture],
  );

  return (
    <div
      ref={containerRef}
      className={["b4-distortion-wave-engine", className ?? ""].filter(Boolean).join(" ")}
      style={{ position: "relative", borderRadius: cornerRadius, overflow: "hidden" }}
    >
      <div
        ref={originalHostRef}
        aria-hidden={revealed || undefined}
        inert={revealed || undefined}
        style={{
          position: revealed ? "absolute" : "relative",
          inset: 0,
          visibility: revealed ? "hidden" : "visible",
          pointerEvents: revealed ? "none" : "auto",
        }}
      >
        {children}
      </div>
      <div
        ref={revealedHostRef}
        aria-hidden={!revealed || undefined}
        inert={!revealed || undefined}
        style={{
          position: revealed ? "relative" : "absolute",
          inset: 0,
          visibility: revealed ? "visible" : "hidden",
          pointerEvents: revealed ? "auto" : "none",
        }}
      >
        {revealedContent}
      </div>
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="b4-distortion-wave-engine__canvas"
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          opacity: canvasVisible ? 1 : 0,
          borderRadius: "inherit",
        }}
      />
      {/* Used only to resolve a palette token to an actual RGB via
          getComputedStyle; never rendered visibly. */}
      <div ref={probeRef} aria-hidden="true" style={{ position: "absolute", width: 0, height: 0, overflow: "hidden" }} />
      {overlay && (
        <div
          className="b4-distortion-wave-engine__overlay"
          style={{ position: "absolute", inset: 0, pointerEvents: "none" }}
        >
          <div style={{ pointerEvents: "auto", position: "relative" }}>{overlay}</div>
        </div>
      )}
      {captureFailed && <span style={{ display: "none" }} data-b4-distortion-wave-capture-failed="true" />}
    </div>
  );
});
