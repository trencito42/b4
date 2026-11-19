import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { usePressFeedback } from "./usePressFeedback.js";

describe("usePressFeedback", () => {
  it("initializes in unpressed state with B4 duration-fast transition token", () => {
    const { result } = renderHook(() => usePressFeedback());
    expect(result.current.isPressed).toBe(false);
    expect(result.current.pressProps.style.transform).toBeUndefined();
    expect(result.current.pressProps.style.transition).toContain("var(--b4-duration-fast");
  });

  it("becomes pressed on pointerDown and scales element", () => {
    const { result } = renderHook(() => usePressFeedback({ scale: 0.95 }));

    act(() => {
      result.current.pressProps.onPointerDown({
        button: 0,
        pointerId: 1,
      } as any);
    });

    expect(result.current.isPressed).toBe(true);
    expect(result.current.pressProps.style.transform).toBe("scale(0.95)");
  });

  it("becomes pressed on keyboard Space/Enter and releases on keyUp", () => {
    const { result } = renderHook(() => usePressFeedback({ scale: 0.95 }));

    act(() => {
      result.current.pressProps.onKeyDown({
        key: " ",
        repeat: false,
      } as any);
    });

    expect(result.current.isPressed).toBe(true);
    expect(result.current.pressProps.style.transform).toBe("scale(0.95)");

    act(() => {
      result.current.pressProps.onKeyUp({
        key: " ",
      } as any);
    });

    expect(result.current.isPressed).toBe(false);
    expect(result.current.pressProps.style.transform).toBeUndefined();
  });

  it("releases and calls onPress on pointerUp", () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => usePressFeedback({ onPress }));

    act(() => {
      result.current.pressProps.onPointerDown({
        button: 0,
        pointerId: 1,
      } as any);
    });

    act(() => {
      result.current.pressProps.onPointerUp({
        pointerId: 1,
      } as any);
    });

    expect(result.current.isPressed).toBe(false);
    expect(onPress).toHaveBeenCalled();
  });

  it("cancels press without calling onPress if pointer leaves or cancels", () => {
    const onPress = vi.fn();
    const { result } = renderHook(() => usePressFeedback({ onPress }));

    act(() => {
      result.current.pressProps.onPointerDown({
        button: 0,
        pointerId: 1,
      } as any);
    });

    act(() => {
      result.current.pressProps.onPointerLeave({
        pointerId: 1,
      } as any);
    });

    expect(result.current.isPressed).toBe(false);
    expect(onPress).not.toHaveBeenCalled();
  });
});
