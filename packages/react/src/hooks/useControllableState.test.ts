import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useControllableState } from "./useControllableState.js";

describe("useControllableState", () => {
  it("works in uncontrolled mode with defaultValue", () => {
    const { result } = renderHook(() =>
      useControllableState({ defaultValue: "initial" }),
    );

    expect(result.current[0]).toBe("initial");

    act(() => {
      result.current[1]("updated");
    });

    expect(result.current[0]).toBe("updated");
  });

  it("works in controlled mode", () => {
    const onChange = vi.fn();
    const { result, rerender } = renderHook(
      ({ val }) => useControllableState({ value: val, onChange }),
      { initialProps: { val: "controlled-1" } },
    );

    expect(result.current[0]).toBe("controlled-1");

    act(() => {
      result.current[1]("attempt-change");
    });

    expect(onChange).toHaveBeenCalledWith("attempt-change");
    // Value remains controlled until prop updates
    expect(result.current[0]).toBe("controlled-1");

    rerender({ val: "controlled-2" });
    expect(result.current[0]).toBe("controlled-2");
  });
});
