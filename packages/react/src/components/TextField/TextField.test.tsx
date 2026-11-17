import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TextField } from "./TextField";

describe("TextField", () => {
  it("is labeled and accepts typed input", async () => {
    const user = userEvent.setup();
    render(<TextField label="Email address" />);

    const input = screen.getByRole("textbox", { name: "Email address" });
    await user.type(input, "hi@example.com");

    expect(input).toHaveValue("hi@example.com");
  });

  it("calls onValueChange as the user types", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TextField label="Email address" onValueChange={onValueChange} />);

    await user.type(screen.getByRole("textbox", { name: "Email address" }), "a");
    expect(onValueChange).toHaveBeenCalled();
  });

  it("shows the error message instead of the hint when both are possible", () => {
    render(
      <TextField
        label="Email address"
        hint="We'll never share this."
        error="Enter a valid email address."
      />,
    );

    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.queryByText("We'll never share this.")).not.toBeInTheDocument();
  });

  it("shows the hint when there is no error", () => {
    render(<TextField label="Email address" hint="We'll never share this." />);
    expect(screen.getByText("We'll never share this.")).toBeInTheDocument();
  });

  it("blocks typing when disabled", async () => {
    const user = userEvent.setup();
    render(<TextField label="Email address" disabled />);

    const input = screen.getByRole("textbox", { name: "Email address" });
    expect(input).toBeDisabled();
    await user.type(input, "a");
    expect(input).toHaveValue("");
  });

  it("has no axe violations across label/hint/error/required/disabled states", async () => {
    const { container } = render(
      <div>
        <TextField label="Default" />
        <TextField label="With hint" hint="A hint." />
        <TextField label="With error" error="An error." />
        <TextField label="Required" required />
        <TextField label="Disabled" disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
