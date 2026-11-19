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

function isInteractiveTarget(target: HTMLElement, container: HTMLElement): boolean {
  let curr: HTMLElement | null = target;
  while (curr && curr !== container) {
    const tag = curr.tagName ? curr.tagName.toLowerCase() : "";
    if (tag === "button" || tag === "input" || tag === "textarea" || tag === "select" || (tag === "a" && curr.hasAttribute("href"))) {
      return true;
    }
    const role = curr.getAttribute ? curr.getAttribute("role") : null;
    if (role === "button" || role === "slider" || role === "tab" || role === "switch" || role === "checkbox") {
      return true;
    }
    if (curr.hasAttribute && curr.hasAttribute("data-no-swipe")) {
      return true;
    }
    // Check if element has horizontal scrolling
    if (curr.scrollWidth > curr.clientWidth) {
      const overflowX = window.getComputedStyle(curr).overflowX;
      if (overflowX === "auto" || overflowX === "scroll") {
        return true;
      }
    }
    curr = curr.parentElement;
  }
  return false;
}

/**
 * Reusable swipe navigation hook for horizontal tab panels, pages, or carousels.
 * Distinguishes horizontal swipes from page scrolling using touch-slop thresholds.
 * Handles RTL, pointer capture, interactive nested controls, and rubber-banding.
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
  const startTimeRef = useRef<number>(0);
  const activePointerIdRef = useRef<number | null>(null);
  const isInteractiveTouchRef = useRef<boolean>(false);

  const enabledItems = items.filter((item) => !item.disabled);
  const currentIndex = enabledItems.findIndex((item) => item.value === value);

  const isRtl = useCallback(() => {
    if (!containerRef.current) return false;
    return window.getComputedStyle(containerRef.current).direction === "rtl";
  }, []);

  const hasPrev = isRtl() ? currentIndex < enabledItems.length - 1 && currentIndex !== -1 : currentIndex > 0;
  const hasNext = isRtl() ? currentIndex > 0 : currentIndex < enabledItems.length - 1 && currentIndex !== -1;

  const gesture = useGestureIntent({
    threshold: 8,
    targetAxis: "horizontal",
    onGestureStart: () => {
      if (disabled || !enabled) return;
      startTimeRef.current = performance.now();
    },
    onGestureMove: (dx, _dy) => {
      if (disabled || !enabled || isInteractiveTouchRef.current) return;
      setIsSwiping(true);

      // Capture pointer so swipe tracks reliably across container boundaries
      if (containerRef.current && activePointerIdRef.current !== null) {
        try {
          if (!containerRef.current.hasPointerCapture(activePointerIdRef.current)) {
            containerRef.current.setPointerCapture(activePointerIdRef.current);
          }
        } catch {
          // Safe fallback
        }
      }

      // Rubber-band resistance at edges
      let clampedDx = dx;
      const rtl = isRtl();
      const cannotGoRight = rtl ? !hasNext : !hasPrev;
      const cannotGoLeft = rtl ? !hasPrev : !hasNext;

      if ((dx > 0 && cannotGoRight) || (dx < 0 && cannotGoLeft)) {
        clampedDx = dx * 0.28; // standard iOS rubber-band damping
      }

      setDragOffset(clampedDx);
      setDirection(dx > 0 ? "right" : dx < 0 ? "left" : null);
    },
    onGestureEnd: (dx, _dy) => {
      if (disabled || !enabled || isInteractiveTouchRef.current) {
        setIsSwiping(false);
        setDragOffset(0);
        setDirection(null);
        return;
      }

      const dt = performance.now() - startTimeRef.current;
      const velocity = Math.abs(dx) / Math.max(dt, 1);

      const containerWidth = containerRef.current?.offsetWidth || 300;
      const threshold = Math.min(minDistance, containerWidth * 0.25);

      const isFlick = velocity > 0.4 && Math.abs(dx) > 20;
      const isDistanceMet = Math.abs(dx) >= threshold;

      if (isFlick || isDistanceMet) {
        const rtl = isRtl();
        // LTR: dx < 0 is swipe left (next), dx > 0 is swipe right (prev)
        // RTL: dx < 0 is swipe left (prev), dx > 0 is swipe right (next)
        const goNext = rtl ? dx > 0 : dx < 0;
        const goPrev = rtl ? dx < 0 : dx > 0;

        if (goNext && currentIndex < enabledItems.length - 1 && currentIndex !== -1) {
          const nextItem = enabledItems[currentIndex + 1];
          if (nextItem) onNavigate(nextItem.value);
        } else if (goPrev && currentIndex > 0) {
          const prevItem = enabledItems[currentIndex - 1];
          if (prevItem) onNavigate(prevItem.value);
        }
      }

      if (containerRef.current && activePointerIdRef.current !== null) {
        try {
          if (containerRef.current.hasPointerCapture(activePointerIdRef.current)) {
            containerRef.current.releasePointerCapture(activePointerIdRef.current);
          }
        } catch {
          // Safe fallback
        }
      }

      activePointerIdRef.current = null;
      setIsSwiping(false);
      setDragOffset(0);
      setDirection(null);
    },
    onGestureCancel: () => {
      if (containerRef.current && activePointerIdRef.current !== null) {
        try {
          if (containerRef.current.hasPointerCapture(activePointerIdRef.current)) {
            containerRef.current.releasePointerCapture(activePointerIdRef.current);
          }
        } catch {
          // Safe fallback
        }
      }
      activePointerIdRef.current = null;
      setIsSwiping(false);
      setDragOffset(0);
      setDirection(null);
    },
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (disabled || !enabled || e.button !== 0) return;
      containerRef.current = e.currentTarget;
      activePointerIdRef.current = e.pointerId;

      // Do not hijack interactive child controls (buttons, inputs, links)
      const target = e.target as HTMLElement;
      isInteractiveTouchRef.current = isInteractiveTarget(target, e.currentTarget);

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
