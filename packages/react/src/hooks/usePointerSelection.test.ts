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
});
