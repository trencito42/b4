import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useGestureIntent } from "./useGestureIntent.js";

describe("useGestureIntent", () => {
  it("determines horizontal intent when dx exceeds threshold and dx > dy", () => {
    const onMove = vi.fn();
    const { result } = renderHook(() =>
      useGestureIntent({
        threshold: 8,
        targetAxis: "horizontal",
        onGestureMove: onMove,
      }),
    );

    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        nativeEvent: {} as PointerEvent,
      } as any);
    });

    expect(result.current.isTracking).toBe(true);

    act(() => {
      result.current.handlePointerMove({
        clientX: 120, // dx = 20 > 8
        clientY: 102, // dy = 2
        pointerId: 1,
        nativeEvent: {} as PointerEvent,
      } as any);
    });

    expect(result.current.isIntentConfirmed).toBe(true);
    expect(result.current.axis).toBe("horizontal");
    expect(onMove).toHaveBeenCalledWith(20, 2, expect.anything());
  });

  it("cancels horizontal intent when dy > dx (user scrolling vertically)", () => {
    const onCancel = vi.fn();
    const { result } = renderHook(() =>
      useGestureIntent({
        threshold: 8,
        targetAxis: "horizontal",
        onGestureCancel: onCancel,
      }),
    );

    act(() => {
      result.current.handlePointerDown({
        button: 0,
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        nativeEvent: {} as PointerEvent,
      } as any);
    });

    act(() => {
      result.current.handlePointerMove({
        clientX: 102, // dx = 2
        clientY: 125, // dy = 25 (vertical scroll)
        pointerId: 1,
        nativeEvent: {} as PointerEvent,
      } as any);
    });

    expect(result.current.isIntentConfirmed).toBe(false);
    expect(result.current.axis).toBe("vertical");
    expect(onCancel).toHaveBeenCalled();
  });
});
