import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Checkbox } from "./Checkbox";

describe("Checkbox", () => {
  it("is labeled and togglable by clicking the label", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    expect(checkbox).not.toBeChecked();

    await user.click(screen.getByText("Accept terms"));
    expect(checkbox).toBeChecked();
  });

  it("calls onCheckedChange with the new value", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Accept terms" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("supports keyboard activation (Space)", async () => {
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" />);

    const checkbox = screen.getByRole("checkbox", { name: "Accept terms" });
    checkbox.focus();
    await user.keyboard(" ");

    expect(checkbox).toBeChecked();
  });

  it("renders an indeterminate state distinct from checked/unchecked", () => {
    render(<Checkbox label="Select all" indeterminate />);
    const checkbox = screen.getByRole("checkbox", { name: "Select all" });
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
  });

  it("blocks interaction when disabled", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Checkbox label="Accept terms" disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("checkbox", { name: "Accept terms" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("has no axe violations across all states", async () => {
    const { container } = render(
      <div>
        <Checkbox label="Unchecked" />
        <Checkbox label="Checked" defaultChecked />
        <Checkbox label="Indeterminate" indeterminate />
        <Checkbox label="Disabled" disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
