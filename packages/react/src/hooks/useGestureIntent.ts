import { useRef, useCallback, useState } from "react";

export type GestureAxis = "horizontal" | "vertical" | null;

export interface UseGestureIntentOptions {
  /** Touch slop threshold in pixels before determining direction. Defaults to 8px. */
  threshold?: number;
  /** Axis to lock on. Defaults to "horizontal". */
  targetAxis?: "horizontal" | "vertical";
  onGestureStart?: (event: PointerEvent) => void;
  onGestureMove?: (deltaX: number, deltaY: number, event: PointerEvent) => void;
  onGestureEnd?: (deltaX: number, deltaY: number, event: PointerEvent) => void;
  onGestureCancel?: (event: PointerEvent) => void;
}

export interface UseGestureIntentResult {
  isTracking: boolean;
  isIntentConfirmed: boolean;
  axis: GestureAxis;
  deltaX: number;
  deltaY: number;
  handlePointerDown: (e: React.PointerEvent) => void;
  handlePointerMove: (e: React.PointerEvent) => void;
  handlePointerUp: (e: React.PointerEvent) => void;
  handlePointerCancel: (e: React.PointerEvent) => void;
  reset: () => void;
}

/**
 * Reusable gesture intent arbiter.
 * Distinguishes horizontal gestures (scrub, swipe) from native vertical scrolling
 * using touch-slop thresholding. Vertical scrolling cancels horizontal intent
 * exactly once and never leaves stale tracking state.
 */
export function useGestureIntent({
  threshold = 8,
  targetAxis = "horizontal",
  onGestureStart,
  onGestureMove,
  onGestureEnd,
  onGestureCancel,
}: UseGestureIntentOptions = {}): UseGestureIntentResult {
  const [isTracking, setIsTracking] = useState(false);
  const [isIntentConfirmed, setIsIntentConfirmed] = useState(false);
  const [axis, setAxis] = useState<GestureAxis>(null);
  const [deltas, setDeltas] = useState({ deltaX: 0, deltaY: 0 });

  const startRef = useRef<{ x: number; y: number; id: number } | null>(null);
  const axisRef = useRef<GestureAxis>(null);
  const confirmedRef = useRef(false);
  const cancelledRef = useRef(false);

  const reset = useCallback(() => {
    startRef.current = null;
    axisRef.current = null;
    confirmedRef.current = false;
    cancelledRef.current = false;
    setIsTracking(false);
    setIsIntentConfirmed(false);
    setAxis(null);
    setDeltas({ deltaX: 0, deltaY: 0 });
  }, []);

  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      // Only track primary pointer interaction
      if (e.button !== 0) return;

      startRef.current = { x: e.clientX, y: e.clientY, id: e.pointerId };
      axisRef.current = null;
      confirmedRef.current = false;
      cancelledRef.current = false;
      setIsTracking(true);
      setIsIntentConfirmed(false);
      setAxis(null);
      setDeltas({ deltaX: 0, deltaY: 0 });

      onGestureStart?.(e.nativeEvent);
    },
    [onGestureStart],
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || e.pointerId !== startRef.current.id || cancelledRef.current) {
        return;
      }

      const dx = e.clientX - startRef.current.x;
      const dy = e.clientY - startRef.current.y;
      setDeltas({ deltaX: dx, deltaY: dy });

      if (!confirmedRef.current) {
        const absX = Math.abs(dx);
        const absY = Math.abs(dy);

        if (absX >= threshold || absY >= threshold) {
          if (targetAxis === "horizontal") {
            if (absX > absY) {
              axisRef.current = "horizontal";
              confirmedRef.current = true;
              setIsIntentConfirmed(true);
              setAxis("horizontal");
            } else {
              // User is scrolling vertically: cancel horizontal gesture exactly once
              cancelledRef.current = true;
              confirmedRef.current = false;
              setIsTracking(false);
              setIsIntentConfirmed(false);
              setAxis("vertical");
              onGestureCancel?.(e.nativeEvent);
              return;
            }
          } else {
            if (absY > absX) {
              axisRef.current = "vertical";
              confirmedRef.current = true;
              setIsIntentConfirmed(true);
              setAxis("vertical");
            } else {
              // User is scrolling horizontally: cancel vertical gesture exactly once
              cancelledRef.current = true;
              confirmedRef.current = false;
              setIsTracking(false);
              setIsIntentConfirmed(false);
              setAxis("horizontal");
              onGestureCancel?.(e.nativeEvent);
              return;
            }
          }
        }
      }

      if (confirmedRef.current) {
        onGestureMove?.(dx, dy, e.nativeEvent);
      }
    },
    [threshold, targetAxis, onGestureMove, onGestureCancel],
  );

  const handlePointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || e.pointerId !== startRef.current.id) return;

      if (confirmedRef.current && !cancelledRef.current) {
        const dx = e.clientX - startRef.current.x;
        const dy = e.clientY - startRef.current.y;
        onGestureEnd?.(dx, dy, e.nativeEvent);
      }
      reset();
    },
    [onGestureEnd, reset],
  );

  const handlePointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (!startRef.current || e.pointerId !== startRef.current.id) return;
      if (!cancelledRef.current) {
        onGestureCancel?.(e.nativeEvent);
      }
      reset();
    },
    [onGestureCancel, reset],
  );

  return {
    isTracking,
    isIntentConfirmed,
    axis,
    deltaX: deltas.deltaX,
    deltaY: deltas.deltaY,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handlePointerCancel,
    reset,
  };
}
