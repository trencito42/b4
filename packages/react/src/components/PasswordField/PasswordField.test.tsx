import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { PasswordField } from "./PasswordField";

describe("PasswordField", () => {
  it("masks the value by default", () => {
    render(<PasswordField label="Password" defaultValue="secret123" />);
    const input = screen.getByLabelText("Password") as HTMLInputElement;
    expect(input.type).toBe("password");
  });

  it("reveals the value when the visibility toggle is clicked, and re-masks on a second click", async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Password" defaultValue="secret123" />);

    const input = screen.getByLabelText("Password") as HTMLInputElement;
    const toggle = screen.getByRole("button", { name: "Show password" });

    await user.click(toggle);
    expect(input.type).toBe("text");

    await user.click(screen.getByRole("button", { name: "Hide password" }));
    expect(input.type).toBe("password");
  });

  it("the toggle is keyboard-reachable", async () => {
    const user = userEvent.setup();
    render(<PasswordField label="Password" />);

    await user.tab(); // into the input
    await user.tab(); // into the toggle button
    expect(screen.getByRole("button", { name: "Show password" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <div>
        <PasswordField label="Default" />
        <PasswordField label="With error" error="Too short." />
        <PasswordField label="Disabled" disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
