import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { CircularProgress } from "./CircularProgress";

describe("CircularProgress", () => {
  it("renders a real progressbar with the correct value", () => {
    render(<CircularProgress label="Uploading" value={60} />);
    const bar = screen.getByRole("progressbar", { name: "Uploading" });
    expect(bar).toHaveAttribute("aria-valuenow", "60");
  });

  it("is indeterminate when value is null", () => {
    render(<CircularProgress label="Processing" value={null} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("data-indeterminate", "");
  });

  it("reduces stroke-dashoffset as the value increases (a real ring, not a static icon)", () => {
    const { container, rerender } = render(<CircularProgress label="Progress" value={25} />);
    const indicator = () => container.querySelector(".b4-circular-progress__indicator")!;
    const offsetAt25 = Number(indicator().getAttribute("stroke-dashoffset"));

    rerender(<CircularProgress label="Progress" value={75} />);
    const offsetAt75 = Number(indicator().getAttribute("stroke-dashoffset"));

    expect(offsetAt75).toBeLessThan(offsetAt25);
  });

  it("shows the formatted value only when showValue is set", () => {
    const { rerender } = render(<CircularProgress label="Uploading" value={60} />);
    expect(screen.queryByText("60%")).not.toBeInTheDocument();

    rerender(<CircularProgress label="Uploading" value={60} showValue />);
    expect(screen.getByText("60%")).toBeInTheDocument();
  });

  it("respects a custom size and stroke width", () => {
    const { container } = render(<CircularProgress label="Uploading" value={50} size={96} strokeWidth={6} />);
    const svg = container.querySelector(".b4-circular-progress__svg")!;
    expect(svg).toHaveAttribute("width", "96");
    expect(svg).toHaveAttribute("height", "96");
  });

  it("has no axe violations, determinate or indeterminate", async () => {
    const { container, rerender } = render(<CircularProgress label="Uploading" value={60} showValue />);
    expect(await axe(container)).toHaveNoViolations();

    rerender(<CircularProgress label="Uploading" value={null} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
