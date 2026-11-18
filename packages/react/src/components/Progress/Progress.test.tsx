import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Progress } from "./Progress";

describe("Progress", () => {
  it("renders a real progressbar with the correct value", () => {
    render(<Progress label="Uploading" value={60} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(bar).toHaveAttribute("aria-valuenow", "60");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("shows the formatted value by default", () => {
    render(<Progress label="Uploading" value={60} />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("can hide the formatted value", () => {
    render(<Progress label="Uploading" value={60} showValue={false} />);
    expect(screen.queryByText("60%")).not.toBeInTheDocument();
  });

  it("is indeterminate when value is null, with no aria-valuenow", () => {
    render(<Progress label="Processing" value={null} />);
    const bar = screen.getByRole("progressbar", { name: "Processing" });
    expect(bar).not.toHaveAttribute("aria-valuenow");
  });

  it("marks itself complete at the max value", () => {
    render(<Progress label="Done" value={100} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-complete", "");
  });

  it("visually hides the label while keeping it in the accessibility tree", () => {
    render(<Progress label="Loading progress" hideLabel value={45} />);
    expect(screen.getByRole("progressbar", { name: "Loading progress" })).toBeInTheDocument();
    expect(screen.getByText("Loading progress")).toHaveClass("b4-progress__label--hidden");
  });

  it("has no axe violations, determinate or indeterminate", async () => {
    const { container, rerender } = render(<Progress label="Uploading" value={60} />);
    expect(await axe(container)).toHaveNoViolations();

    rerender(<Progress label="Uploading" value={null} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
