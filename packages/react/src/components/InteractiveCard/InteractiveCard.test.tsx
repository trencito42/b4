import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { InteractiveCard } from "./InteractiveCard";

describe("InteractiveCard", () => {
  it("renders as a real button", () => {
    render(<InteractiveCard>Open project</InteractiveCard>);
    expect(screen.getByRole("button", { name: "Open project" })).toBeInTheDocument();
  });

  it("calls onClick when pressed", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<InteractiveCard onClick={onClick}>Open project</InteractiveCard>);

    await user.click(screen.getByRole("button", { name: "Open project" }));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("does not call onClick when disabled", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(
      <InteractiveCard onClick={onClick} disabled>
        Open project
      </InteractiveCard>,
    );

    const button = screen.getByRole("button", { name: "Open project" });
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("supports keyboard activation", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<InteractiveCard onClick={onClick}>Open project</InteractiveCard>);

    const button = screen.getByRole("button", { name: "Open project" });
    button.focus();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations, enabled and disabled", async () => {
    const { container } = render(
      <div>
        <InteractiveCard>Enabled</InteractiveCard>
        <InteractiveCard disabled>Disabled</InteractiveCard>
      </div>,
    );

    expect(await axe(container)).toHaveNoViolations();
  });
});
