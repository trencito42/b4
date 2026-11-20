import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ToggleGroup } from "./ToggleGroup";

const alignItems = [
  { value: "left", children: "Left" },
  { value: "center", children: "Center" },
  { value: "right", children: "Right" },
] as const;

describe("ToggleGroup", () => {
  it("renders every item as a button and marks the default value pressed", () => {
    render(<ToggleGroup aria-label="Alignment" items={alignItems} defaultValue={["center"]} />);

    expect(screen.getByRole("button", { name: "Left" })).not.toHaveAttribute("data-pressed");
    expect(screen.getByRole("button", { name: "Center" })).toHaveAttribute("data-pressed");
    expect(screen.getByRole("button", { name: "Right" })).not.toHaveAttribute("data-pressed");
  });

  it("replaces the pressed item in single-select mode", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Alignment" items={alignItems} defaultValue={["left"]} onValueChange={onValueChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Right" }));

    expect(onValueChange).toHaveBeenCalledWith(["right"]);
    expect(screen.getByRole("button", { name: "Left" })).not.toHaveAttribute("data-pressed");
    expect(screen.getByRole("button", { name: "Right" })).toHaveAttribute("data-pressed");
  });

  it("keeps several items pressed at once when multiple is set", async () => {
    const user = userEvent.setup();
    render(<ToggleGroup aria-label="Formatting" multiple items={alignItems} defaultValue={["left"]} />);

    await user.click(screen.getByRole("button", { name: "Right" }));

    expect(screen.getByRole("button", { name: "Left" })).toHaveAttribute("data-pressed");
    expect(screen.getByRole("button", { name: "Right" })).toHaveAttribute("data-pressed");
  });

  it("allows clearing back to no pressed item — the difference from SegmentedControl", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    render(
      <ToggleGroup aria-label="Alignment" items={alignItems} defaultValue={["left"]} onValueChange={onValueChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Left" }));

    expect(onValueChange).toHaveBeenCalledWith([]);
    expect(screen.getByRole("button", { name: "Left" })).not.toHaveAttribute("data-pressed");
  });

  it("supports controlled usage", async () => {
    function Controlled() {
      const [value, setValue] = useState<string[]>(["left"]);
      return <ToggleGroup aria-label="Alignment" items={alignItems} value={value} onValueChange={setValue} />;
    }
    const user = userEvent.setup();
    render(<Controlled />);

    await user.click(screen.getByRole("button", { name: "Center" }));
    expect(screen.getByRole("button", { name: "Center" })).toHaveAttribute("data-pressed");
  });

  it("moves focus between items with the arrow keys (Base UI roving focus)", async () => {
    const user = userEvent.setup();
    render(<ToggleGroup aria-label="Alignment" items={alignItems} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Left" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Center" })).toHaveFocus();
  });

  it("blocks interaction on a disabled item and on a disabled group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = render(
      <ToggleGroup
        aria-label="Export"
        onValueChange={onValueChange}
        items={[
          { value: "csv", children: "CSV" },
          { value: "pdf", children: "PDF", disabled: true },
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: "PDF" }));
    expect(onValueChange).not.toHaveBeenCalled();

    rerender(
      <ToggleGroup
        aria-label="Export"
        disabled
        onValueChange={onValueChange}
        items={[
          { value: "csv", children: "CSV" },
          { value: "pdf", children: "PDF" },
        ]}
      />,
    );
    await user.click(screen.getByRole("button", { name: "CSV" }));
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("names an icon-only item from its label", () => {
    render(
      <ToggleGroup
        aria-label="Formatting"
        items={[{ value: "bold", children: <svg aria-hidden="true" />, label: "Bold" }]}
      />,
    );
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
  });

  it("applies the orientation to the group element", () => {
    const { container } = render(
      <ToggleGroup aria-label="Layout" orientation="vertical" items={alignItems} />,
    );
    expect(container.querySelector(".b4-toggle-group")).toHaveClass("b4-toggle-group--vertical");
  });

  it("has no axe violations across sizes, orientations and both modes", async () => {
    const { container } = render(
      <div>
        {(["sm", "md", "lg"] as const).map((size) => (
          <ToggleGroup key={size} aria-label={`Alignment ${size}`} size={size} items={alignItems} defaultValue={["left"]} />
        ))}
        <ToggleGroup aria-label="Vertical layout" orientation="vertical" items={alignItems} />
        <ToggleGroup aria-label="Formatting" multiple items={alignItems} defaultValue={["left", "right"]} />
        <ToggleGroup aria-label="Disabled group" disabled items={alignItems} />
      </div>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
