import { useState, useCallback, useRef } from "react";

export interface UseControllableStateOptions<T> {
  value?: T;
  defaultValue?: T | (() => T);
  onChange?: (value: T) => void;
}

/**
 * Robust controlled/uncontrolled state hook following the React community standard.
 * If `value !== undefined`, it is controlled.
 * Otherwise, internal state is used.
 */
export function useControllableState<T>({
  value: controlledValue,
  defaultValue,
  onChange,
}: UseControllableStateOptions<T>): [T, (next: T | ((prev: T) => T)) => void] {
  const isControlled = controlledValue !== undefined;
  const [internalValue, setInternalValue] = useState<T>(() => {
    if (defaultValue !== undefined) {
      return typeof defaultValue === "function"
        ? (defaultValue as () => T)()
        : defaultValue;
    }
    return controlledValue as T;
  });

  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const value = isControlled ? (controlledValue as T) : internalValue;

  const setValue = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved = typeof next === "function" ? (next as (prev: T) => T)(value) : next;
      if (Object.is(resolved, value)) return;

      if (!isControlled) {
        setInternalValue(resolved);
      }
      onChangeRef.current?.(resolved);
    },
    [isControlled, value],
  );

  return [value, setValue];
}
