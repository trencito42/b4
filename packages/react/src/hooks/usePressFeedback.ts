import { useState, useCallback, useRef } from "react";
import { springs, useReducedMotion } from "@b4/motion";

export interface UsePressFeedbackOptions {
  disabled?: boolean;
  scale?: number;
  onPress?: () => void;
}

export interface UsePressFeedbackResult {
  isPressed: boolean;
  pressProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    style: React.CSSProperties;
  };
}

/**
 * Reusable press feedback hook providing iOS-inspired immediate tactile response.
 * Responds on pointer down (scale: 0.96 by default with springs.snap),
 * cancels immediately if pointer leaves or cancels, and respects reduced motion.
 */
export function usePressFeedback({
  disabled = false,
  scale = 0.96,
  onPress,
}: UsePressFeedbackOptions = {}): UsePressFeedbackResult {
  const [isPressed, setIsPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const pointerIdRef = useRef<number | null>(null);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (disabled || e.button !== 0) return;
      pointerIdRef.current = e.pointerId;
      setIsPressed(true);
    },
    [disabled],
  );

  const onPointerUp = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        pointerIdRef.current = null;
        if (isPressed) {
          setIsPressed(false);
          onPress?.();
        }
      }
    },
    [isPressed, onPress],
  );

  const onPointerLeave = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        pointerIdRef.current = null;
        setIsPressed(false);
      }
    },
    [],
  );

  const onPointerCancel = useCallback(
    (e: React.PointerEvent) => {
      if (pointerIdRef.current === e.pointerId) {
        pointerIdRef.current = null;
        setIsPressed(false);
      }
    },
    [],
  );

  const style: React.CSSProperties = {
    transform: !disabled && !reducedMotion && isPressed ? `scale(${scale})` : undefined,
    transition: reducedMotion
      ? "none"
      : `transform ${springs.snap.damping}ms cubic-bezier(0.2, 0.8, 0.2, 1)`,
  };

  return {
    isPressed,
    pressProps: {
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      style,
    },
  };
}
