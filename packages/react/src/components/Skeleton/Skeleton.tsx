import type { CSSProperties } from "react";

export type SkeletonVariant = "text" | "circle" | "rect";

export interface SkeletonProps {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  className?: string;
}

/**
 * A loading placeholder with a real shimmer sweep (a moving gradient,
 * not a flat static block pretending to be "loading"). Purely
 * decorative — `aria-hidden`, since the content it stands in for isn't
 * there yet; pair it with a real `aria-busy`/`role="status"` on the
 * container that's loading (see `LoadingOverlay` for a full blocking
 * version of that pattern) rather than announcing each skeleton shape
 * individually.
 */
export function Skeleton({ variant = "text", width, height, className }: SkeletonProps) {
  const style: CSSProperties = {};
  if (width !== undefined) style.width = width;
  if (height !== undefined) style.height = height;

  return (
    <span
      aria-hidden="true"
      className={["b4-skeleton", `b4-skeleton--${variant}`, className ?? ""].filter(Boolean).join(" ")}
      style={style}
    />
  );
}
