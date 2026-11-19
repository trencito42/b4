import { forwardRef, useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@b4/motion";

export type DistortionWaveAmplitude = "sm" | "md" | "lg";
export type DistortionWaveDirection = "horizontal" | "vertical";
export type DistortionWaveTone = "accent" | "success" | "warning" | "danger" | "info";

export interface DistortionWaveProps {
  children: ReactNode;
  /** Whether the wave is running. Defaults to true. */
  active?: boolean;
  /** How hard the wave distorts what it passes over. Defaults to "md". */
  amplitude?: DistortionWaveAmplitude;
  /** Axis the wave travels along. Defaults to "horizontal". */
  direction?: DistortionWaveDirection;
  /** Tint of the wave's chromatic edge, read from existing B4 tokens — not a custom hex. */
  tone?: DistortionWaveTone;
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
const amplitudeToGeometry: Record<DistortionWaveAmplitude, { blur: string; saturate: string; contrast: string }> = {
  sm: { blur: "2px", saturate: "1.25", contrast: "1.04" },
  md: { blur: "4px", saturate: "1.45", contrast: "1.08" },
  lg: { blur: "7px", saturate: "1.7", contrast: "1.12" },
};

const toneToVar: Record<DistortionWaveTone, string> = {
  accent: "var(--b4-accent-text)",
  success: "var(--b4-success)",
  warning: "var(--b4-warning)",
  danger: "var(--b4-danger-text)",
  info: "var(--b4-info)",
};

/**
 * A wave of refraction that travels across its child, bending the
 * content underneath it as it passes — the counterpoint to `BorderBeam`,
 * which traces a child's perimeter instead of crossing its face.
 *
 * The distortion is real, not painted: the wave layer uses
 * `backdrop-filter` to blur, saturate and re-contrast the pixels
 * *actually rendered behind it* (the child's own text, icons and
 * surfaces), so the content genuinely refracts where the wave passes and
 * resolves again once it has moved on. A soft chromatic fringe and a
 * specular crest ride along with the same band, sharing one keyframe
 * track so they can never drift apart.
 *
 * Purely decorative: `aria-hidden`, `pointer-events: none`, never shifts
 * layout, never captures focus. Pauses itself via `IntersectionObserver`
 * when scrolled off-screen, and under `useReducedMotion()` it holds
 * still as a static tinted sheen — the band stops travelling and the
 * content stops being blurred, because a wave that does not move should
 * not leave text sitting behind frosted glass.
 */
export const DistortionWave = forwardRef<HTMLDivElement, DistortionWaveProps>(function DistortionWave(
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
      className={["b4-distortion-wave", `b4-distortion-wave--${direction}`, className ?? ""].filter(Boolean).join(" ")}
      style={{ borderRadius: radius }}
    >
      {children}
      {active && (
        <span
          aria-hidden="true"
          className={[
            "b4-distortion-wave__layer",
            moving ? "b4-distortion-wave__layer--moving" : "b4-distortion-wave__layer--static",
          ].join(" ")}
          style={
            {
              "--b4-distortion-wave-blur": geometry.blur,
              "--b4-distortion-wave-saturate": geometry.saturate,
              "--b4-distortion-wave-contrast": geometry.contrast,
              "--b4-distortion-wave-tone": toneToVar[tone],
              "--b4-distortion-wave-duration": `${duration}s`,
            } as CSSProperties
          }
        >
          <span className="b4-distortion-wave__band" />
          <span className="b4-distortion-wave__fringe" />
        </span>
      )}
    </div>
  );
});
