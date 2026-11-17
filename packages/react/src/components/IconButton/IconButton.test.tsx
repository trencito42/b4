import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { IconButton } from "./IconButton";

const icon = <svg aria-hidden="true" />;

describe("IconButton", () => {
  it("is announced via aria-label", () => {
    render(<IconButton icon={icon} aria-label="Add item" />);
    expect(screen.getByRole("button", { name: "Add item" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton icon={icon} aria-label="Add item" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "Add item" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("blocks clicks while loading or disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<IconButton icon={icon} aria-label="Add item" onClick={onClick} loading />);

    const button = screen.getByRole("button", { name: "Add item" });
    expect(button).toBeDisabled();
    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("has no axe violations across all variants", async () => {
    const { container } = render(
      <div>
        <IconButton icon={icon} aria-label="Primary action" variant="primary" />
        <IconButton icon={icon} aria-label="Secondary action" variant="secondary" />
        <IconButton icon={icon} aria-label="Ghost action" variant="ghost" />
        <IconButton icon={icon} aria-label="Destructive action" variant="destructive" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
