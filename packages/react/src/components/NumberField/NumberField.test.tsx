import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { NumberField } from "./NumberField";

describe("NumberField", () => {
  it("keeps one editable input mounted through stepping and direct edits", async () => {
    const user = userEvent.setup();
    render(<NumberField label="Quantity" defaultValue={5} min={0} max={99} />);
    const input = screen.getByRole("textbox", { name: "Quantity" });
    await user.click(screen.getByRole("button", { name: "Increase value" }));
    await user.click(screen.getByRole("button", { name: "Increase value" }));
    expect(screen.getByRole("textbox")).toBe(input);
    expect(input).toHaveValue("7");
    await user.clear(input);
    await user.type(input, "12");
    expect(screen.getAllByRole("textbox")).toHaveLength(1);
    expect(input).toHaveValue("12");
  });
  // The visible NumberField.Input renders type="text"/inputmode="numeric"
  // (role "textbox"), not type="number" — Base UI keeps a separate hidden
  // type="number" input (aria-hidden) for native form semantics. Query
  // the visible one as "textbox", matching what a user/screen-reader
  // actually interacts with.
  it("is labeled via the surrounding Field, not an aria-label on the input itself", () => {
    render(<NumberField label="Quantity" defaultValue={1} />);
    expect(screen.getByRole("textbox", { name: "Quantity" })).toBeInTheDocument();
  });

  it("increments and decrements via the stepper buttons", async () => {
    const user = userEvent.setup();
    render(<NumberField label="Quantity" defaultValue={5} />);

    await user.click(screen.getByRole("button", { name: "Increase value" }));
    expect(screen.getByRole("textbox", { name: "Quantity" })).toHaveValue("6");

    await user.click(screen.getByRole("button", { name: "Decrease value" }));
    await user.click(screen.getByRole("button", { name: "Decrease value" }));
    expect(screen.getByRole("textbox", { name: "Quantity" })).toHaveValue("4");
  });

  it("clamps to min/max", async () => {
    const user = userEvent.setup();
    render(<NumberField label="Quantity" defaultValue={0} min={0} max={2} />);

    const decrement = screen.getByRole("button", { name: "Decrease value" });
    expect(decrement).toHaveAttribute("aria-disabled", "true");

    const increment = screen.getByRole("button", { name: "Increase value" });
    await user.click(increment);
    await user.click(increment);
    expect(screen.getByRole("textbox", { name: "Quantity" })).toHaveValue("2");
    expect(increment).toHaveAttribute("aria-disabled", "true");
  });

  it("calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <NumberField label="Quantity" defaultValue={1} onValueChange={onValueChange} />,
    );

    await user.click(screen.getByRole("button", { name: "Increase value" }));
    expect(onValueChange).toHaveBeenCalledWith(2, expect.anything());
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <NumberField label="Default" defaultValue={1} />
        <NumberField label="With error" error="Required." />
        <NumberField label="Disabled" disabled defaultValue={1} />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
