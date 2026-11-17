import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ToggleButton } from "./ToggleButton";

describe("ToggleButton", () => {
  it("toggles pressed state on click", async () => {
    const user = userEvent.setup();
    render(<ToggleButton>Mute</ToggleButton>);

    const button = screen.getByRole("button", { name: "Mute" });
    expect(button).not.toHaveAttribute("data-pressed");

    await user.click(button);
    expect(button).toHaveAttribute("data-pressed");

    await user.click(button);
    expect(button).not.toHaveAttribute("data-pressed");
  });

  it("calls onPressedChange with the new value", async () => {
    const onPressedChange = vi.fn();
    const user = userEvent.setup();
    render(<ToggleButton onPressedChange={onPressedChange}>Mute</ToggleButton>);

    await user.click(screen.getByRole("button", { name: "Mute" }));
    expect(onPressedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("supports keyboard activation (Space)", async () => {
    const user = userEvent.setup();
    render(<ToggleButton>Mute</ToggleButton>);

    const button = screen.getByRole("button", { name: "Mute" });
    button.focus();
    await user.keyboard(" ");

    expect(button).toHaveAttribute("data-pressed");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <ToggleButton>Unpressed</ToggleButton>
        <ToggleButton defaultPressed>Pressed</ToggleButton>
        <ToggleButton disabled>Disabled</ToggleButton>
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
