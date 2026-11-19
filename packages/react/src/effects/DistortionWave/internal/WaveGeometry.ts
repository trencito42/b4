import type { DistortionWaveType } from "../types.js";

/**
 * The wavefront's geometry, as a deterministic function of progress and
 * the measured source/container rects — separated from React and from
 * WebGL so it can be unit-tested and scrubbed without a GPU context.
 *
 * All values are in *normalized container space*: 0..1 across the
 * container's own width/height, origin at the container's top-left. This
 * is the same space the fragment shader's `vUv` varying uses, so this
 * module's output can be passed straight into uniforms.
 */
export interface WaveGeometryInput {
  type: DistortionWaveType;
  /** 0 (not started) .. 1 (fully travelled). */
  progress: number;
  /** The source rect, in container-relative pixels. */
  sourceRect: { x: number; y: number; width: number; height: number };
  /** The container's own size, in pixels. */
  containerSize: { width: number; height: number };
  /** Optional explicit focus point, in container-relative pixels. Defaults to the source rect's center. */
  focus?: { x: number; y: number };
}

export interface WaveGeometry {
  /** Normalized (0..1) focus/origin point the wave travels from. */
  originUv: { x: number; y: number };
  /** Normalized travel axis unit vector (direction the front moves). */
  axis: { x: number; y: number };
  /**
   * The current front's signed-distance offset along `axis`, in
   * normalized units, measured from `originUv`. 0 at the start of travel;
   * grows toward a value large enough that the front has fully left the
   * container by progress 1 (so "reveal everywhere" is reached exactly at
   * progress 1, not before or after).
   */
  frontOffset: number;
  /** "linear" (vertical/horizontal) or "radial" (center) — tells the shader which signed-distance function to use. */
  mode: "linear" | "radial";
  /** Max normalized distance the front must travel to fully clear the container — used to size `frontOffset`'s growth and the shader's reveal falloff consistently. */
  travelExtent: number;
}

/**
 * Pure function: given a progress value and the measured rects, returns
 * the wavefront's current geometry. Called every animation frame by
 * `WaveController` (cheap — no allocation beyond the returned object) and
 * directly by tests/the scrub debug UI without any WebGL involved.
 */
export function computeWaveGeometry({
  type,
  progress,
  sourceRect,
  containerSize,
  focus,
}: WaveGeometryInput): WaveGeometry {
  const { width: cw, height: ch } = containerSize;
  const focusPoint = focus ?? {
    x: sourceRect.x + sourceRect.width / 2,
    y: sourceRect.y + sourceRect.height / 2,
  };
  const originUv = {
    x: cw > 0 ? focusPoint.x / cw : 0.5,
    y: ch > 0 ? focusPoint.y / ch : 0.5,
  };

  const p = Math.max(0, Math.min(1, progress));

  if (type === "center") {
    // The front is a ring expanding from originUv. travelExtent is the
    // normalized distance from the origin to the container's farthest
    // corner, so the ring has fully cleared every pixel by progress 1.
    const cornerDistances = [
      Math.hypot(originUv.x - 0, originUv.y - 0),
      Math.hypot(originUv.x - 1, originUv.y - 0),
      Math.hypot(originUv.x - 0, originUv.y - 1),
      Math.hypot(originUv.x - 1, originUv.y - 1),
    ];
    const travelExtent = Math.max(...cornerDistances) * 1.05;
    return {
      originUv,
      axis: { x: 0, y: 0 },
      frontOffset: p * travelExtent,
      mode: "radial",
      travelExtent,
    };
  }

  // vertical: front is a horizontal line, travels along +y (downward) by
  // default from the source — chosen so a bottom-anchored button (the
  // common "Confirm" case) sends the wave up through the card.
  // horizontal: front is a vertical line, travels along +x.
  const axis = type === "vertical" ? { x: 0, y: -1 } : { x: 1, y: 0 };
  // travelExtent: normalized distance from the origin to the farthest
  // edge in the direction of travel, so the front exits the container
  // exactly at progress 1 regardless of where the source sits.
  const travelExtent =
    type === "vertical"
      ? Math.max(originUv.y, 1 - originUv.y) * 1.05 + 0.15
      : Math.max(originUv.x, 1 - originUv.x) * 1.05 + 0.15;

  return {
    originUv,
    axis,
    frontOffset: p * travelExtent,
    mode: "linear",
    travelExtent,
  };
}
