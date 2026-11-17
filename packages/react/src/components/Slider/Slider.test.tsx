import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Slider } from "./Slider";

describe("Slider", () => {
  it("renders a single labeled thumb with the correct value", () => {
    render(<Slider label="Volume" defaultValue={40} />);
    const thumb = screen.getByRole("slider", { name: "Volume" });
    expect(thumb).toHaveAttribute("aria-valuenow", "40");
  });

  it("moves the value with arrow keys and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Slider label="Volume" defaultValue={40} onValueChange={onValueChange} />);

    screen.getByRole("slider", { name: "Volume" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(onValueChange).toHaveBeenCalledWith(41, expect.anything());
  });

  it("renders two thumbs for an array (range) value", () => {
    render(<Slider label="Price range" defaultValue={[20, 80]} />);
    const thumbs = screen.getAllByRole("slider");
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute("aria-valuenow", "20");
    expect(thumbs[1]).toHaveAttribute("aria-valuenow", "80");
  });

  it("applies a custom format function to the displayed value", () => {
    render(<Slider label="Opacity" defaultValue={75} format={(v) => `${v}%`} />);
    expect(screen.getByText("75%")).toBeInTheDocument();
  });

  it("blocks interaction when disabled", () => {
    render(<Slider label="Volume" defaultValue={40} disabled />);
    expect(screen.getByRole("slider", { name: "Volume" })).toBeDisabled();
  });

  it("has no axe violations for single and range sliders", async () => {
    const { container } = render(
      <div>
        <Slider label="Volume" defaultValue={40} />
        <Slider label="Price range" defaultValue={[20, 80]} />
        <Slider label="Disabled" defaultValue={40} disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
