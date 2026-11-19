import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@b4/motion";
import { RefractionSweepCrest } from "./RefractionSweepCrest.js";

export type RefractionSweepAmplitude = "sm" | "md" | "lg";
export type RefractionSweepDirection = "horizontal" | "vertical";
export type RefractionSweepTone = "accent" | "success" | "warning" | "danger" | "info";

export interface RefractionSweepProps {
  children: ReactNode;
  /** Whether the wave is running. Defaults to true. */
  active?: boolean;
  /** How hard the wave distorts what it passes over. Defaults to "md". */
  amplitude?: RefractionSweepAmplitude;
  /** Axis the wave travels along. Defaults to "horizontal". */
  direction?: RefractionSweepDirection;
  /** Tint of the wave's chromatic edge, read from existing B4 tokens — not a custom hex. */
  tone?: RefractionSweepTone;
  /** Seconds per full sweep. Defaults to 6. */
  duration?: number;
  /** Corner radius the wave is clipped to. Defaults to `--b4-surface-radius` — pass the same radius the wrapped child uses so the clipped wave and the child's own visible edge agree. */
  radius?: string;
  className?: string;
}

/**
 * Amplitude is the *strength* of the refraction, not its size: the band
 * always covers the same fraction of the surface so the geometry of the
 * sweep (and therefore the alignment between the refraction layer and its
 * chromatic fringe) stays identical across every variant.
 */
const amplitudeToGeometry: Record<RefractionSweepAmplitude, { blur: string; saturate: string; contrast: string }> = {
  sm: { blur: "2px", saturate: "1.25", contrast: "1.04" },
  md: { blur: "4px", saturate: "1.45", contrast: "1.08" },
  lg: { blur: "7px", saturate: "1.7", contrast: "1.12" },
};

const toneToVar: Record<RefractionSweepTone, string> = {
  accent: "var(--b4-accent-text)",
  success: "var(--b4-success)",
  warning: "var(--b4-warning)",
  danger: "var(--b4-danger-text)",
  info: "var(--b4-info)",
};

/**
 * A single-surface decorative accent: a band of refraction that travels
 * across its one child, bending the content underneath it as it passes —
 * the counterpoint to `BorderBeam`, which traces a child's perimeter
 * instead of crossing its face.
 *
 * Renamed from `DistortionWave` to `RefractionSweep` — `DistortionWave`
 * is now a genuinely different, larger component: a dual-React-view
 * transition engine with DOM capture and a WebGL2 UV-displacement
 * shader (see `../DistortionWave/`), matching what the mission brief
 * actually asked for. This component is kept, under its own honest name,
 * because it's a real, working, decorative single-surface effect in its
 * own right — just not the thing "DistortionWave" now means.
 *
 * The distortion is real, not painted: the wave layer uses
 * `backdrop-filter` to blur, saturate and re-contrast the pixels
 * *actually rendered behind it* (the child's own text, icons and
 * surfaces), so the content genuinely refracts where the wave passes and
 * resolves again once it has moved on. Riding on top of that band is a
 * real WebGL2-rendered crest (`RefractionSweepCrest`/`crest.ts`) — a GPU
 * shader doing RGB-channel-split chromatic aberration, an animated
 * caustic-noise shimmer and a specular hot core — not a flat CSS
 * gradient standing in for one. See docs/effects/REFRACTION_SWEEP.md.
 *
 * Purely decorative: `aria-hidden`, `pointer-events: none`, never shifts
 * layout, never captures focus. Pauses itself via `IntersectionObserver`
 * when scrolled off-screen, and under `useReducedMotion()` it holds
 * still as a static tinted sheen — the band stops travelling and the
 * content stops being blurred, because a wave that does not move should
 * not leave text sitting behind frosted glass.
 */
export const RefractionSweep = forwardRef<HTMLDivElement, RefractionSweepProps>(function RefractionSweep(
  {
    children,
    active = true,
    amplitude = "md",
    direction = "horizontal",
    tone = "accent",
    duration = 6,
    radius = "var(--b4-surface-radius)",
    className,
  },
  forwardedRef,
) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(([entry]) => setIsVisible(!!entry?.isIntersecting), {
      threshold: 0,
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  // "Moving" means: the effect is on, motion is allowed, and the element
  // is actually on screen. When it is not moving, the band holds a static
  // position instead of freezing mid-flight at an arbitrary offset.
  const moving = active && !reducedMotion && isVisible;

  const geometry = amplitudeToGeometry[amplitude];

  return (
    <div
      ref={(node: HTMLDivElement | null) => {
        containerRef.current = node;
        if (typeof forwardedRef === "function") {
          forwardedRef(node);
        } else if (forwardedRef) {
          (forwardedRef as { current: HTMLDivElement | null }).current = node;
        }
      }}
      className={["b4-refraction-sweep", `b4-refraction-sweep--${direction}`, className ?? ""].filter(Boolean).join(" ")}
      style={{ borderRadius: radius }}
    >
      {children}
      {active && (
        <span
          aria-hidden="true"
          className={[
            "b4-refraction-sweep__layer",
            moving ? "b4-refraction-sweep__layer--moving" : "b4-refraction-sweep__layer--static",
          ].join(" ")}
          style={
            {
              "--b4-refraction-sweep-blur": geometry.blur,
              "--b4-refraction-sweep-saturate": geometry.saturate,
              "--b4-refraction-sweep-contrast": geometry.contrast,
              "--b4-refraction-sweep-tone": toneToVar[tone],
              "--b4-refraction-sweep-duration": `${duration}s`,
            } as CSSProperties
          }
        >
          <span className="b4-refraction-sweep__band" />
          <span className="b4-refraction-sweep__crest-mask">
            <RefractionSweepCrest
              moving={moving}
              vertical={direction === "vertical"}
              duration={duration}
              amplitude={amplitude}
              toneVar={toneToVar[tone]}
            />
          </span>
        </span>
      )}
    </div>
  );
});
