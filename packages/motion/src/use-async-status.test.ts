import { describe, expect, it, vi } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useAsyncStatus } from "./use-async-status.js";

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: unknown) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

describe("useAsyncStatus", () => {
  it("starts idle", () => {
    const { result } = renderHook(() => useAsyncStatus());
    expect(result.current.status).toBe("idle");
  });

  it("goes pending -> success", async () => {
    const { result } = renderHook(() => useAsyncStatus());

    let runPromise!: Promise<void>;
    act(() => {
      runPromise = result.current.run(() => Promise.resolve());
    });
    expect(result.current.status).toBe("pending");

    await act(async () => {
      await runPromise;
    });
    expect(result.current.status).toBe("success");
  });

  it("goes pending -> error and rethrows", async () => {
    const { result } = renderHook(() => useAsyncStatus());
    const boom = new Error("boom");

    let thrown: unknown;
    await act(async () => {
      try {
        await result.current.run(() => Promise.reject(boom));
      } catch (error) {
        thrown = error;
      }
    });

    expect(thrown).toBe(boom);
    expect(result.current.status).toBe("error");
  });

  it("auto-returns to idle after successDuration", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAsyncStatus({ successDuration: 500 }));

    await act(async () => {
      await result.current.run(() => Promise.resolve());
    });
    expect(result.current.status).toBe("success");

    await act(async () => {
      vi.advanceTimersByTime(500);
    });
    expect(result.current.status).toBe("idle");
    vi.useRealTimers();
  });

  it("a later call's status is never stomped back to idle by an earlier call's stale timeout", async () => {
    vi.useFakeTimers();
    const { result } = renderHook(() => useAsyncStatus({ successDuration: 100 }));

    const first = deferred<void>();
    let firstRun!: Promise<void>;
    act(() => {
      firstRun = result.current.run(() => first.promise);
    });

    // Second call starts (and finishes) while the first is still pending —
    // simulates a rapid re-click/retry race.
    await act(async () => {
      await result.current.run(() => Promise.resolve());
    });
    expect(result.current.status).toBe("success");

    // Now the first call resolves late; it must not override the second
    // call's success status, and its own stale auto-idle timer must not
    // fire either.
    await act(async () => {
      first.resolve();
      await firstRun;
    });

    await act(async () => {
      vi.advanceTimersByTime(100);
    });

    // The *second* call's own auto-idle timer is the only one allowed to
    // fire, and only once, resulting in idle — not an error or a stuck
    // success from a stale generation.
    expect(result.current.status).toBe("idle");
    vi.useRealTimers();
  });
});
