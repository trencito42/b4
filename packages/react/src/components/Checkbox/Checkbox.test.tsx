import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
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

  it("keeps the control and its focus when a controlled owner changes mixed to checked", () => {
    const ref = createRef<HTMLButtonElement>();
    const { rerender } = render(
      <Checkbox ref={ref} label="Select all" checked={false} indeterminate />,
    );
    const control = screen.getByRole("checkbox", { name: "Select all" });
    control.focus();
    rerender(<Checkbox ref={ref} label="Select all" checked />);
    expect(control).toBeChecked();
    expect(ref.current).toBe(control);
    expect(control).toHaveFocus();
    rerender(<Checkbox ref={ref} label="Select all" checked={false} />);
    expect(control).not.toBeChecked();
    expect(ref.current).toBe(control);
  });

  it("does not show a checked state when the controlled owner rejects a toggle", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    render(
      <Checkbox
        label="Optional emails"
        checked={false}
        onCheckedChange={onCheckedChange}
      />,
    );
    const control = screen.getByRole("checkbox");
    for (let count = 0; count < 6; count++) await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledTimes(6);
    expect(control).not.toBeChecked();
    expect(screen.getAllByRole("checkbox")).toHaveLength(1);
  });

  it("preserves native form submission through the animated render target", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <form>
        <Checkbox label="Product updates" name="updates" required />
      </form>,
    );
    const form = container.querySelector("form")!;
    expect(new FormData(form).has("updates")).toBe(false);
    await user.click(screen.getByRole("checkbox"));
    expect(new FormData(form).get("updates")).toBe("on");
  });
});
