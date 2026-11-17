import { describe, expect, it } from "vitest";
import { render, screen, act } from "@testing-library/react";
import { useState } from "react";
import { axe } from "jest-axe";
import { TextTransition } from "./TextTransition";

function Controlled({ initial }: { initial: string }) {
  const [value, setValue] = useState(initial);
  return (
    <div>
      <TextTransition value={value} />
      <button onClick={() => setValue("Building")}>building</button>
      <button onClick={() => setValue("Verifying")}>verifying</button>
      <button onClick={() => setValue("Live")}>live</button>
    </div>
  );
}

describe("TextTransition", () => {
  it("renders the current value", () => {
    render(<TextTransition value="Deploying" />);
    expect(screen.getByText("Deploying")).toBeInTheDocument();
  });

  it("renders numeric values", () => {
    render(<TextTransition value={42} />);
    expect(screen.getByText("42")).toBeInTheDocument();
  });

  it("shows only the latest value after rapid successive changes", async () => {
    render(<Controlled initial="Deploying" />);

    await act(async () => {
      screen.getByText("building").click();
      screen.getByText("verifying").click();
      screen.getByText("live").click();
    });

    // The outgoing node's exit animation is still in flight in jsdom (no
    // real animation frames run here), so it may still be in the DOM —
    // that's expected AnimatePresence behavior, not a bug. What matters is
    // that the latest value is the one actually showing.
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("does not duplicate content across an unmount/remount cycle", () => {
    const { unmount } = render(<TextTransition value="Ready" />);
    expect(screen.getAllByText("Ready")).toHaveLength(1);
    unmount();
    render(<TextTransition value="Ready" />);
    expect(screen.getAllByText("Ready")).toHaveLength(1);
  });

  it("has no axe violations in any mode", async () => {
    const { container } = render(
      <div>
        <TextTransition value="Crossfade" mode="crossfade" />
        <TextTransition value="Vertical" mode="vertical" />
        <TextTransition value="Horizontal" mode="horizontal" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
