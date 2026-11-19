import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { useReducedMotion } from "@b4/motion";

export type BorderBeamSize = "sm" | "md" | "lg";
export type BorderBeamTone = "accent" | "success" | "warning" | "danger" | "info" | "aurora";

export interface BorderBeamProps {
  children: ReactNode;
  /** Whether the beam is running. Defaults to true. */
  active?: boolean;
  /** Beam line thickness. Defaults to "sm". */
  size?: BorderBeamSize;
  /** Semantic color, read from existing B4 tokens — not a custom hex. "aurora" blends three existing tokens (accent/danger/warning) into a soft multi-hue halo instead of a single flat color. */
  tone?: BorderBeamTone;
  /** Seconds per full revolution. Defaults to 6. */
  duration?: number;
  /** Corner radius the beam traces. Defaults to `--b4-surface-radius` — pass the same radius the wrapped child uses so the beam and the child's own visible border agree. */
  radius?: string;
  className?: string;
}

// clip is the masked band's width (where the glow is allowed to render) —
// deliberately wider than the nominal beam "width" below, so the blurred
// light has room to spread instead of being cut off flush against a hard
// edge. blur softens the conic-gradient itself into a diffuse glow rather
// than a crisp line.
const sizeToGeometry: Record<BorderBeamSize, { width: string; clip: string; blur: string; spark: string }> = {
  sm: { width: "1.5px", clip: "6px", blur: "3px", spark: "5px" },
  md: { width: "2.5px", clip: "9px", blur: "4.5px", spark: "7px" },
  lg: { width: "4px", clip: "13px", blur: "6px", spark: "9px" },
};

const toneToVar: Record<BorderBeamTone, string> = {
  accent: "var(--b4-accent-500)",
  success: "var(--b4-success)",
  warning: "var(--b4-warning)",
  danger: "var(--b4-danger-text)",
  info: "var(--b4-info)",
  // The thin comet ring still needs one color even in "aurora" mode —
  // the multi-hue blend lives in the halo (.b4-border-beam__halo--aurora
  // in BorderBeam.css), which reads --b4-accent-500/--b4-danger/
  // --b4-warning directly rather than through this single-value map.
  aurora: "var(--b4-accent-500)",
};

/**
 * A restrained light beam that travels the true perimeter of its
 * child, rounded corners included — a masked, rotating conic-gradient
 * ring (the standard CSS "border mask XOR" technique: two inset
 * linear-gradient mask layers composited with `exclude`, which leaves
 * exactly the border-width ring visible, following whatever
 * `border-radius` is set rather than a rectangular clip box), not an
 * unrelated moving gradient laid over the whole surface. Purely
 * decorative: `aria-hidden`, `pointer-events: none`, never shifts
 * layout, never captures focus. Pauses itself via
 * `IntersectionObserver` when scrolled off-screen, and collapses to a
 * static (non-spinning) glow under `useReducedMotion()` rather than
 * disappearing outright — the ring itself can still be a meaningful
 * state indicator even when motion is off.
 */
export function BorderBeam({
  children,
  active = true,
  size = "sm",
  tone = "accent",
  duration = 6,
  radius = "var(--b4-surface-radius)",
  className,
}: BorderBeamProps) {
  const reducedMotion = useReducedMotion();
  const containerRef = useRef<HTMLDivElement>(null);
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

  const spinning = active && !reducedMotion && isVisible;

  return (
    <div ref={containerRef} className={["b4-border-beam", className ?? ""].filter(Boolean).join(" ")} style={{ borderRadius: radius }}>
      {children}
      {active && (
        <>
          {/* The ambient halo deliberately lives OUTSIDE the masked ring
              below: the ring's mask clips its content to a thin band
              around the border, but the halo is meant to bloom well past
              the card's own edges (inset is negative), so it cannot be a
              child of that masked element without being clipped away. */}
          <span
            aria-hidden="true"
            className={[
              "b4-border-beam__halo",
              tone === "aurora" ? "b4-border-beam__halo--aurora" : "",
              spinning ? "b4-border-beam__halo--breathing" : "",
            ]
              .filter(Boolean)
              .join(" ")}
            style={
              {
                borderRadius: radius,
                "--b4-border-beam-color": toneToVar[tone],
              } as CSSProperties
            }
          />
          <span
            aria-hidden="true"
            className={["b4-border-beam__ring", spinning ? "b4-border-beam__ring--spinning" : ""].filter(Boolean).join(" ")}
            style={
              {
                borderRadius: radius,
                "--b4-border-beam-clip": sizeToGeometry[size].clip,
                "--b4-border-beam-blur": sizeToGeometry[size].blur,
                "--b4-border-beam-color": toneToVar[tone],
                "--b4-border-beam-duration": `${duration}s`,
                "--b4-border-beam-spark-size": sizeToGeometry[size].spark,
                "--b4-border-beam-radius": radius,
              } as CSSProperties
            }
          >
            <span className="b4-border-beam__gradient b4-border-beam__gradient--wake" />
            <span className="b4-border-beam__gradient" />
            <span className="b4-border-beam__spark" />
          </span>
        </>
      )}
    </div>
  );
}
