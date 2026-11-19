import { useState, useRef, useCallback } from "react";
import { useGestureIntent } from "./useGestureIntent.js";

export interface SwipeNavigationItem {
  value: string;
  disabled?: boolean;
}

export interface UseSwipeNavigationOptions {
  items: readonly SwipeNavigationItem[];
  value: string;
  onNavigate: (value: string) => void;
  disabled?: boolean;
  /** Whether swipe is enabled. Defaults to true. */
  enabled?: boolean;
  /** Distance in pixels to trigger navigation. Defaults to 48px or 25% of width. */
  minDistance?: number;
}

export interface UseSwipeNavigationResult {
  /** Real-time drag displacement in pixels for smooth finger-following transforms. */
  dragOffset: number;
  /** Whether swipe gesture is currently active. */
  isSwiping: boolean;
  /** Direction of active swipe attempt. */
  direction: "left" | "right" | null;
  /** Spread onto the swipeable container element. */
  containerProps: {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
    style?: React.CSSProperties;
  };
}

/**
 * Reusable swipe navigation hook for horizontal tab panels, pages, or carousels.
 * Distinguishes horizontal swipes from page scrolling using touch-slop thresholds.
 * Applies rubber-banding at edges and smoothly transitions between enabled panels.
 */
export function useSwipeNavigation({
  items,
  value,
  onNavigate,
  disabled = false,
  enabled = true,
  minDistance = 48,
}: UseSwipeNavigationOptions): UseSwipeNavigationResult {
  const [dragOffset, setDragOffset] = useState(0);
  const [isSwiping, setIsSwiping] = useState(false);
  const [direction, setDirection] = useState<"left" | "right" | null>(null);

  const containerRef = useRef<HTMLElement | null>(null);
  const startXRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

  const enabledItems = items.filter((item) => !item.disabled);
  const currentIndex = enabledItems.findIndex((item) => item.value === value);

  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < enabledItems.length - 1 && currentIndex !== -1;

  const gesture = useGestureIntent({
    threshold: 8,
    targetAxis: "horizontal",
    onGestureStart: (e) => {
      if (disabled || !enabled) return;
      startXRef.current = e.clientX;
      startTimeRef.current = performance.now();
    },
    onGestureMove: (dx, _dy) => {
      if (disabled || !enabled) return;
      setIsSwiping(true);

      // Rubber-band resistance at edges
      let clampedDx = dx;
      if ((dx > 0 && !hasPrev) || (dx < 0 && !hasNext)) {
        clampedDx = dx * 0.28; // standard iOS/Alloy rubber-band damping
      }

      setDragOffset(clampedDx);
      setDirection(dx > 0 ? "right" : dx < 0 ? "left" : null);
    },
    onGestureEnd: (e) => {
      if (disabled || !enabled) return;

      const dx = e.clientX - startXRef.current;
      const dt = performance.now() - startTimeRef.current;
      const velocity = Math.abs(dx) / Math.max(dt, 1); // px per ms

      const containerWidth = containerRef.current?.offsetWidth || 300;
      const threshold = Math.min(minDistance, containerWidth * 0.25);

      const isFlick = velocity > 0.4 && Math.abs(dx) > 20;
      const isDistanceMet = Math.abs(dx) >= threshold;

      if (isFlick || isDistanceMet) {
        if (dx < 0 && hasNext) {
          // Swipe left -> go to next panel
          const nextItem = enabledItems[currentIndex + 1];
          if (nextItem) onNavigate(nextItem.value);
        } else if (dx > 0 && hasPrev) {
          // Swipe right -> go to previous panel
          const prevItem = enabledItems[currentIndex - 1];
          if (prevItem) onNavigate(prevItem.value);
        }
      }

      setIsSwiping(false);
      setDragOffset(0);
      setDirection(null);
    },
    onGestureCancel: () => {
      setIsSwiping(false);
      setDragOffset(0);
      setDirection(null);
    },
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (disabled || !enabled) return;
      containerRef.current = e.currentTarget;
      gesture.handlePointerDown(e);
    },
    [disabled, enabled, gesture],
  );

  return {
    dragOffset,
    isSwiping,
    direction,
    containerProps: {
      onPointerDown,
      onPointerMove: gesture.handlePointerMove,
      onPointerUp: gesture.handlePointerUp,
      onPointerCancel: gesture.handlePointerCancel,
      style: {
        touchAction: "pan-y",
        userSelect: isSwiping ? "none" : undefined,
        WebkitUserSelect: isSwiping ? "none" : undefined,
      },
    },
  };
}
