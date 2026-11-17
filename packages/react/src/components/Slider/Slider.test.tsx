import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Slider } from "./Slider";
import { useState } from "react";

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

  it("keeps controlled thumbs and formatted values in sync", async () => {
    const user = userEvent.setup();
    function Example() {
      const [value, setValue] = useState<number | number[]>(40);
      return (
        <Slider
          label="Volume"
          value={value}
          onValueChange={setValue}
          format={(v) => `${v}%`}
        />
      );
    }
    render(<Example />);
    await user.tab();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "41");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuetext", "41%");
    expect(screen.getByText("41%")).toBeInTheDocument();
  });

  it("names the range group and each individual thumb", () => {
    render(
      <Slider
        label="Price"
        defaultValue={[20, 80]}
        thumbLabels={["Minimum price", "Maximum price"]}
      />,
    );
    expect(screen.getByRole("group", { name: "Price" })).toBeInTheDocument();
    expect(screen.getByRole("slider", { name: "Minimum price" })).toHaveAttribute(
      "aria-valuenow",
      "20",
    );
    expect(screen.getByRole("slider", { name: "Maximum price" })).toHaveAttribute(
      "aria-valuenow",
      "80",
    );
  });

  it("supports Home and End without escaping the bounds", async () => {
    const user = userEvent.setup();
    render(<Slider label="Budget" min={10} max={50} defaultValue={30} />);
    await user.tab();
    await user.keyboard("{Home}{ArrowLeft}");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "10");
    await user.keyboard("{End}{ArrowRight}");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-valuenow", "50");
  });

  it("submits the numeric form value", () => {
    const { container } = render(
      <form>
        <Slider label="Volume" name="volume" defaultValue={40} />
      </form>,
    );
    expect(new FormData(container.querySelector("form")!).get("volume")).toBe("40");
  });

  it("associates an error instead of the hint", () => {
    render(
      <Slider
        label="Budget"
        defaultValue={80}
        hint="Choose carefully"
        error="Budget exceeded"
      />,
    );
    expect(screen.getByRole("slider")).toHaveAccessibleDescription("Budget exceeded");
    expect(screen.getByRole("slider")).toHaveAttribute("aria-invalid", "true");
    expect(screen.queryByText("Choose carefully")).not.toBeInTheDocument();
  });

  it.each(["sm", "md", "lg"] as const)(
    "is axe-clean across variants at size %s",
    async (size) => {
      const { container } = render(
        <div>
          <Slider label="Neutral" size={size} defaultValue={40} />
          <Slider label="Primary" variant="primary" size={size} defaultValue={40} />
          <Slider label="Error" size={size} error="Check the budget" />
          <Slider label="Disabled" size={size} disabled />
        </div>,
      );
      expect(await axe(container)).toHaveNoViolations();
    },
  );

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
