import { useCallback, useRef, useState } from "react";

export type AsyncStatus = "idle" | "pending" | "success" | "error";

export interface UseAsyncStatusOptions {
  /** Auto-return to "idle" this many ms after success. 0/undefined = stay on "success". */
  successDuration?: number;
  /** Auto-return to "idle" this many ms after error. 0/undefined = stay on "error". */
  errorDuration?: number;
}

export interface UseAsyncStatusResult {
  status: AsyncStatus;
  /** Runs `action`, driving status pending → success/error (→ idle, if a duration is set). */
  run: (action: () => Promise<unknown>) => Promise<void>;
  reset: () => void;
}

/**
 * The "async state transition" utility named in the mission brief: models
 * the label→spinner→success(/error/retry) lifecycle so a component (a
 * Button's `loading` prop, a form's submit state, a Toast) doesn't have to
 * hand-roll it with ad-hoc booleans.
 *
 * **Race safety**: if `run` is called again (e.g. the user re-submits)
 * before a previous call's auto-idle timeout has fired, a generation
 * counter invalidates that stale timeout — it is guaranteed to never stomp
 * a newer, in-flight call's status back to "idle".
 */
export function useAsyncStatus(options: UseAsyncStatusOptions = {}): UseAsyncStatusResult {
  const { successDuration, errorDuration } = options;
  const [status, setStatus] = useState<AsyncStatus>("idle");
  const generation = useRef(0);

  const run = useCallback(
    async (action: () => Promise<unknown>) => {
      const myGeneration = ++generation.current;
      setStatus("pending");

      try {
        await action();
        if (myGeneration !== generation.current) return;
        setStatus("success");
        if (successDuration) {
          setTimeout(() => {
            if (myGeneration === generation.current) setStatus("idle");
          }, successDuration);
        }
      } catch (error) {
        if (myGeneration === generation.current) {
          setStatus("error");
          if (errorDuration) {
            setTimeout(() => {
              if (myGeneration === generation.current) setStatus("idle");
            }, errorDuration);
          }
        }
        throw error;
      }
    },
    [successDuration, errorDuration],
  );

  const reset = useCallback(() => {
    generation.current += 1;
    setStatus("idle");
  }, []);

  return { status, run, reset };
}
