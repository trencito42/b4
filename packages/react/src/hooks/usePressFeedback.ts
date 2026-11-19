import { useState, useCallback, useRef } from "react";
import { useReducedMotion } from "@b4/motion";

export interface UsePressFeedbackOptions {
  disabled?: boolean;
  scale?: number;
  /** Optional callback fired when press is released without cancellation. */
  onPress?: () => void;
}

export interface UsePressFeedbackResult {
  isPressed: boolean;
  pressProps: {
    onPointerDown: (e: React.PointerEvent) => void;
    onPointerUp: (e: React.PointerEvent) => void;
    onPointerLeave: (e: React.PointerEvent) => void;
    onPointerCancel: (e: React.PointerEvent) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onKeyUp: (e: React.KeyboardEvent) => void;
    style: React.CSSProperties;
  };
}

/**
 * Reusable press feedback hook providing iOS-inspired immediate tactile response.
 * Responds on pointer down and keyboard activation (Space/Enter).
 * Uses real B4 motion tokens (duration-fast: 140ms, ease-standard) rather than
 * mistaking spring damping coefficients for milliseconds.
 * Pure tactile presentation: preserves native click and keyboard behavior without duplicate actions.
 */
export function usePressFeedback({
  disabled = false,
  scale = 0.96,
  onPress,
}: UsePressFeedbackOptions = {}): UsePressFeedbackResult {
  const [isPressed, setIsPressed] = useState(false);
  const reducedMotion = useReducedMotion();
  const pointerIdRef = useRef<number | null>(null);
  const isKeyboardPressedRef = useRef(false);

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

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (disabled || e.repeat) return;
      if (e.key === " " || e.key === "Enter") {
        isKeyboardPressedRef.current = true;
        setIsPressed(true);
      }
    },
    [disabled],
  );

  const onKeyUp = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === " " || e.key === "Enter") {
        if (isKeyboardPressedRef.current) {
          isKeyboardPressedRef.current = false;
          setIsPressed(false);
        }
      }
    },
    [],
  );

  const style: React.CSSProperties = {
    transform: !disabled && !reducedMotion && isPressed ? `scale(${scale})` : undefined,
    transition: reducedMotion
      ? "none"
      : "transform var(--b4-duration-fast, 140ms) var(--b4-ease-standard, cubic-bezier(0.4, 0, 0.2, 1))",
  };

  return {
    isPressed,
    pressProps: {
      onPointerDown,
      onPointerUp,
      onPointerLeave,
      onPointerCancel,
      onKeyDown,
      onKeyUp,
      style,
    },
  };
}
