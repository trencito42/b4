import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePointerSelection } from "./usePointerSelection.js";
import { useSwipeNavigation } from "./useSwipeNavigation.js";

describe("usePointerSelection", () => {
  it("initializes displayValue to current value", () => {
    const items = [{ value: "tab1" }, { value: "tab2" }] as const;
    const { result } = renderHook(() =>
      usePointerSelection({
        items,
        value: "tab1",
        onCommit: vi.fn(),
      }),
    );

    expect(result.current.displayValue).toBe("tab1");
    expect(result.current.isScrubbing).toBe(false);
  });

  it("suppresses click events via onClickCapture after a scrub release", () => {
    const onCommit = vi.fn();
    const items = [{ value: "tab1" }, { value: "tab2" }] as const;
    const { result } = renderHook(() =>
      usePointerSelection({
        items,
        value: "tab1",
        onCommit,
      }),
    );

    // Simulate pointer down and move (scrubbing)
    const container = document.createElement("div");
    act(() => {
      result.current.containerProps.onPointerDown({
        button: 0,
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        currentTarget: container,
        nativeEvent: {} as PointerEvent,
      } as any);
      result.current.containerProps.onPointerMove({
        clientX: 50,
        clientY: 10,
        pointerId: 1,
        nativeEvent: {} as PointerEvent,
      } as any);
      result.current.containerProps.onPointerUp({
        clientX: 50,
        clientY: 10,
        pointerId: 1,
        currentTarget: container,
        nativeEvent: {} as PointerEvent,
      } as any);
    });

    const clickEvent = {
      preventDefault: vi.fn(),
      stopPropagation: vi.fn(),
    };

    act(() => {
      result.current.containerProps.onClickCapture?.(clickEvent as any);
    });

    expect(clickEvent.preventDefault).toHaveBeenCalled();
    expect(clickEvent.stopPropagation).toHaveBeenCalled();
  });

  it("cancels scrubbing on Escape key without committing", () => {
    const onCommit = vi.fn();
    const items = [{ value: "tab1" }, { value: "tab2" }] as const;
    const { result } = renderHook(() =>
      usePointerSelection({
        items,
        value: "tab1",
        onCommit,
      }),
    );

    const container = document.createElement("div");
    act(() => {
      result.current.containerProps.onPointerDown({
        button: 0,
        clientX: 10,
        clientY: 10,
        pointerId: 1,
        currentTarget: container,
        nativeEvent: {} as PointerEvent,
      } as any);
      result.current.containerProps.onPointerMove({
        clientX: 50,
        clientY: 10,
        pointerId: 1,
        nativeEvent: {} as PointerEvent,
      } as any);
    });

    expect(result.current.isScrubbing).toBe(true);

    act(() => {
      result.current.containerProps.onKeyDown({
        key: "Escape",
      } as any);
    });

    expect(result.current.isScrubbing).toBe(false);
    expect(result.current.displayValue).toBe("tab1");
    expect(onCommit).not.toHaveBeenCalled();
  });
});

describe("useSwipeNavigation", () => {
  it("initializes with zero offset", () => {
    const items = [{ value: "panel1" }, { value: "panel2" }];
    const { result } = renderHook(() =>
      useSwipeNavigation({
        items,
        value: "panel1",
        onNavigate: vi.fn(),
      }),
    );

    expect(result.current.dragOffset).toBe(0);
    expect(result.current.isSwiping).toBe(false);
  });

  it("skips disabled panels when navigating", () => {
    const onNavigate = vi.fn();
    const items = [
      { value: "panel1" },
      { value: "panel2", disabled: true },
      { value: "panel3" },
    ];
    const { result } = renderHook(() =>
      useSwipeNavigation({
        items,
        value: "panel1",
        onNavigate,
      }),
    );

    const container = document.createElement("div");
    Object.defineProperty(container, "offsetWidth", { value: 300 });

    act(() => {
      result.current.containerProps.onPointerDown({
        button: 0,
        clientX: 200,
        clientY: 100,
        pointerId: 1,
        currentTarget: container,
        target: container,
        nativeEvent: {} as PointerEvent,
      } as any);
      result.current.containerProps.onPointerMove({
        clientX: 100, // dx = -100 (swipe left to next)
        clientY: 100,
        pointerId: 1,
        nativeEvent: {} as PointerEvent,
      } as any);
      result.current.containerProps.onPointerUp({
        clientX: 100,
        clientY: 100,
        pointerId: 1,
        currentTarget: container,
        nativeEvent: {} as PointerEvent,
      } as any);
    });

    // Should skip disabled panel2 and navigate directly to panel3
    expect(onNavigate).toHaveBeenCalledWith("panel3");
  });
});
