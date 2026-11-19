import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ResourceMeter } from "./ResourceMeter";

describe("ResourceMeter", () => {
  it("renders as a real meter with correct value attributes", () => {
    render(<ResourceMeter label="Storage" value={42} max={100} unit="GB" />);
    const meter = screen.getByRole("meter", { name: "Storage" });
    expect(meter).toHaveAttribute("aria-valuenow", "42");
    expect(meter).toHaveAttribute("aria-valuemin", "0");
    expect(meter).toHaveAttribute("aria-valuemax", "100");
    expect(meter).toHaveAttribute("aria-valuetext", "42 GB of 100 GB");
  });

  it("renders the formatted value and max as visible text", () => {
    render(<ResourceMeter label="Storage" value={42} max={100} unit="GB" />);
    expect(screen.getByText("42 GB / 100 GB")).toBeInTheDocument();
  });

  it("defaults max to 100 when omitted", () => {
    render(<ResourceMeter label="CPU" value={50} />);
    expect(screen.getByRole("meter")).toHaveAttribute("aria-valuemax", "100");
  });

  it("auto-computes tone from percentage: neutral, warning, danger", () => {
    const { container, rerender } = render(<ResourceMeter label="Usage" value={50} />);
    expect(container.querySelector(".b4-resource-meter__fill--neutral")).not.toBeNull();

    rerender(<ResourceMeter label="Usage" value={80} />);
    expect(container.querySelector(".b4-resource-meter__fill--warning")).not.toBeNull();

    rerender(<ResourceMeter label="Usage" value={95} />);
    expect(container.querySelector(".b4-resource-meter__fill--danger")).not.toBeNull();
  });

  it("lets an explicit tone override the auto-computed one", () => {
    const { container } = render(<ResourceMeter label="Usage" value={10} tone="danger" />);
    expect(container.querySelector(".b4-resource-meter__fill--danger")).not.toBeNull();
  });

  it("clamps the visual fill width to the 0-100% range even if value exceeds max", () => {
    const { container } = render(<ResourceMeter label="Usage" value={150} max={100} />);
    const fill = container.querySelector(".b4-resource-meter__fill") as HTMLElement;
    expect(fill.style.width).toBe("100%");
  });

  it("has no axe violations across the tone matrix", async () => {
    const { container } = render(
      <div>
        <ResourceMeter label="A" value={10} />
        <ResourceMeter label="B" value={80} />
        <ResourceMeter label="C" value={95} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
