import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { NumberTransition } from "./NumberTransition";

describe("NumberTransition", () => {
  it("renders the formatted value", () => {
    render(<NumberTransition value={1284} />);
    expect(screen.getByText("1,284")).toBeInTheDocument();
  });

  it("supports a custom formatter", () => {
    render(<NumberTransition value={4899} format={(n) => `$${(n / 100).toFixed(2)}`} />);
    expect(screen.getByText("$48.99")).toBeInTheDocument();
  });

  it("updates to the new value when re-rendered with a different number", () => {
    const { rerender } = render(<NumberTransition value={10} />);
    expect(screen.getByText("10")).toBeInTheDocument();

    rerender(<NumberTransition value={25} />);
    // The outgoing "10" node's exit animation may still be in flight in
    // jsdom (no real animation frames here) — what matters is the new
    // value is the one actually showing.
    expect(screen.getByText("25")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<NumberTransition value={42} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
