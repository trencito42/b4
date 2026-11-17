import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { AnimatedIndicator } from "./AnimatedIndicator";

function TwoTabDemo() {
  const [selected, setSelected] = useState<"a" | "b">("a");
  return (
    <div>
      <button onClick={() => setSelected("a")} data-testid="tab-a">
        {selected === "a" && (
          <AnimatedIndicator layoutId="demo-indicator" data-testid="indicator" />
        )}
        A
      </button>
      <button onClick={() => setSelected("b")} data-testid="tab-b">
        {selected === "b" && (
          <AnimatedIndicator layoutId="demo-indicator" data-testid="indicator" />
        )}
        B
      </button>
    </div>
  );
}

describe("AnimatedIndicator", () => {
  it("renders exactly one indicator at a time as selection moves between hosts", () => {
    render(<TwoTabDemo />);

    expect(screen.getAllByTestId("indicator")).toHaveLength(1);
    expect(screen.getByTestId("tab-a")).toContainElement(screen.getByTestId("indicator"));

    fireEvent.click(screen.getByTestId("tab-b"));

    expect(screen.getAllByTestId("indicator")).toHaveLength(1);
    expect(screen.getByTestId("tab-b")).toContainElement(screen.getByTestId("indicator"));
  });

  it("survives rapid alternating moves without duplicating or disappearing", () => {
    render(<TwoTabDemo />);

    for (let i = 0; i < 10; i++) {
      fireEvent.click(i % 2 === 0 ? screen.getByTestId("tab-b") : screen.getByTestId("tab-a"));
    }

    expect(screen.getAllByTestId("indicator")).toHaveLength(1);
  });
});
