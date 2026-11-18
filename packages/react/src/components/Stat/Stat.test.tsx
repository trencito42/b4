import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Stat } from "./Stat";

describe("Stat", () => {
  it("renders its label and value", () => {
    render(<Stat label="Revenue" value="$1,200" />);
    expect(screen.getByText("Revenue")).toBeInTheDocument();
    expect(screen.getByText("$1,200")).toBeInTheDocument();
  });

  it("renders a trend when provided", () => {
    render(<Stat label="Revenue" value="$1,200" trend={{ label: "+8%", direction: "up" }} />);
    expect(screen.getByText("+8%")).toBeInTheDocument();
  });

  it("omits the trend when not provided", () => {
    const { container } = render(<Stat label="Revenue" value="$1,200" />);
    expect(container.querySelector(".b4-stat__trend")).toBeNull();
  });

  it("renders a description when provided", () => {
    render(<Stat label="Revenue" value="$1,200" description="vs. last month" />);
    expect(screen.getByText("vs. last month")).toBeInTheDocument();
  });

  it("has no axe violations across the trend-direction matrix", async () => {
    for (const direction of ["up", "down", "neutral"] as const) {
      const { container, unmount } = render(
        <Stat label="Revenue" value="$1,200" trend={{ label: "x", direction }} />,
      );
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
