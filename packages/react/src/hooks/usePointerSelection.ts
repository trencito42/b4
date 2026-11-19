import { useState, useRef, useCallback, useEffect } from "react";
import { useGestureIntent } from "./useGestureIntent.js";

export interface PointerSelectionItem<T extends string> {
  value: T;
  disabled?: boolean;
}

export interface UsePointerSelectionOptions<T extends string> {
  items: readonly PointerSelectionItem<T>[];
  value: T;
  onCommit: (value: T) => void;
  disabled?: boolean;
  /** Whether scrubbing is enabled. Defaults to true. */
  enabled?: boolean;
  orientation?: "horizontal" | "vertical";
}

export interface UsePointerSelectionResult<T extends string> {
  /** The value to visually display (active scrub preview or committed value). */
  displayValue: T;
  /** Whether user is actively scrubbing across items. */
  isScrubbing: boolean;
  /** Container props to spread onto the interactive container. */
  containerProps: {
    onPointerDown: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerMove: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerUp: (e: React.PointerEvent<HTMLElement>) => void;
    onPointerCancel: (e: React.PointerEvent<HTMLElement>) => void;
    onClickCapture?: (e: React.MouseEvent<HTMLElement>) => void;
    onKeyDown: (e: React.KeyboardEvent<HTMLElement>) => void;
    style?: React.CSSProperties;
  };
}

/**
 * Reusable pointer scrubbing and drag-to-select interaction hook.
 * Allows touching/clicking an item and sliding/scrubbing across adjacent items
 * to preview and select options.
 *
 * Guaranteed contract:
 * - Synchronously tracks current and last-valid hovered segment (no stale state).
 * - Commits the actual last-valid segment on pointer release.
 * - Suppresses subsequent synthetic click events after scrubbing to prevent
 *   duplicate callbacks or accidental Base UI click commits.
 */
export function usePointerSelection<T extends string>({
  items,
  value,
  onCommit,
  disabled = false,
  enabled = true,
  orientation = "horizontal",
}: UsePointerSelectionOptions<T>): UsePointerSelectionResult<T> {
  const [previewValue, setPreviewValue] = useState<T | null>(null);
  const containerRef = useRef<HTMLElement | null>(null);
  const isScrubbingRef = useRef(false);
  const [isScrubbingState, setIsScrubbingState] = useState(false);

  // Synchronous refs to prevent stale state issues during rapid movement/release
  const valueRef = useRef<T>(value);
  valueRef.current = value;

  const lastValidHitRef = useRef<T>(value);
  const didScrubRef = useRef(false);
  const suppressClickUntilRef = useRef<number>(0);

  // Keep lastValidHitRef in sync with value when not scrubbing
  useEffect(() => {
    if (!isScrubbingRef.current) {
      lastValidHitRef.current = value;
      setPreviewValue(null);
    }
  }, [value]);

  const findItemFromPoint = useCallback(
    (clientX: number, clientY: number): T | null => {
      if (!containerRef.current) return null;
      const itemElements = Array.from(
        containerRef.current.querySelectorAll<HTMLElement>("[data-b4-segment-value]"),
      );

      for (const el of itemElements) {
        const rect = el.getBoundingClientRect();
        if (
          clientX >= rect.left &&
          clientX <= rect.right &&
          clientY >= rect.top &&
          clientY <= rect.bottom
        ) {
          const itemVal = el.getAttribute("data-b4-segment-value") as T;
          const match = items.find((i) => i.value === itemVal);
          if (match && !match.disabled) {
            return itemVal;
          }
          return null;
        }
      }

      // If within horizontal container bounds, find segment by X column
      if (orientation === "horizontal") {
        for (const el of itemElements) {
          const rect = el.getBoundingClientRect();
          if (clientX >= rect.left && clientX <= rect.right) {
            const itemVal = el.getAttribute("data-b4-segment-value") as T;
            const match = items.find((i) => i.value === itemVal);
            if (match && !match.disabled) {
              return itemVal;
            }
          }
        }
      }

      return null;
    },
    [items, orientation],
  );

  const gesture = useGestureIntent({
    threshold: 6,
    targetAxis: orientation,
    onGestureStart: (e) => {
      if (disabled || !enabled) return;
      didScrubRef.current = false;
      const hit = findItemFromPoint(e.clientX, e.clientY);
      if (hit) {
        lastValidHitRef.current = hit;
        setPreviewValue(hit);
      }
    },
    onGestureMove: (_dx, _dy, e) => {
      if (disabled || !enabled) return;
      didScrubRef.current = true;
      if (!isScrubbingRef.current) {
        isScrubbingRef.current = true;
        setIsScrubbingState(true);
      }
      const hit = findItemFromPoint(e.clientX, e.clientY);
      if (hit) {
        lastValidHitRef.current = hit;
        setPreviewValue(hit);
      }
    },
    onGestureEnd: (_dx, _dy, e) => {
      if (disabled || !enabled) return;

      const wasScrubbing = didScrubRef.current;
      if (wasScrubbing) {
        // Suppress any following click event to prevent duplicate commits
        suppressClickUntilRef.current = Date.now() + 250;
      }

      // Read release target immediately from point or fallback to last synchronously recorded valid hit
      const releaseHit = findItemFromPoint(e.clientX, e.clientY);
      const target = releaseHit ?? lastValidHitRef.current;

      isScrubbingRef.current = false;
      setIsScrubbingState(false);
      setPreviewValue(null);
      didScrubRef.current = false;

      if (wasScrubbing && target && target !== valueRef.current) {
        onCommit(target);
      }
    },
    onGestureCancel: () => {
      isScrubbingRef.current = false;
      setIsScrubbingState(false);
      setPreviewValue(null);
      didScrubRef.current = false;
    },
  });

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      if (disabled || !enabled) return;
      containerRef.current = e.currentTarget;
      try {
        e.currentTarget.setPointerCapture(e.pointerId);
      } catch {
        // Fallback for non-supporting environments
      }
      gesture.handlePointerDown(e);
    },
    [disabled, enabled, gesture],
  );

  const onPointerMove = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      gesture.handlePointerMove(e);
    },
    [gesture],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe fallback
      }
      gesture.handlePointerUp(e);
    },
    [gesture],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      try {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) {
          e.currentTarget.releasePointerCapture(e.pointerId);
        }
      } catch {
        // Safe fallback
      }
      gesture.handlePointerCancel(e);
    },
    [gesture],
  );

  const onClickCapture = useCallback((e: React.MouseEvent<HTMLElement>) => {
    // If a scrub gesture just committed, suppress the synthetic click
    if (Date.now() < suppressClickUntilRef.current) {
      e.preventDefault();
      e.stopPropagation();
    }
  }, []);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLElement>) => {
      if (e.key === "Escape" && isScrubbingRef.current) {
        isScrubbingRef.current = false;
        setIsScrubbingState(false);
        setPreviewValue(null);
        didScrubRef.current = false;
        gesture.reset();
      }
    },
    [gesture],
  );

  const displayValue = previewValue ?? value;

  return {
    displayValue,
    isScrubbing: isScrubbingState,
    containerProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onPointerCancel,
      onClickCapture,
      onKeyDown,
      style: {
        touchAction: orientation === "horizontal" ? "pan-y" : "pan-x",
        userSelect: isScrubbingState ? "none" : undefined,
        WebkitUserSelect: isScrubbingState ? "none" : undefined,
      },
    },
  };
}
