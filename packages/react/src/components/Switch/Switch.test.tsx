import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Switch } from "./Switch";

describe("Switch", () => {
  it("is labeled and togglable by clicking the label", async () => {
    const user = userEvent.setup();
    render(<Switch label="Enable notifications" />);

    const switchEl = screen.getByRole("switch", { name: "Enable notifications" });
    expect(switchEl).not.toBeChecked();

    await user.click(screen.getByText("Enable notifications"));
    expect(switchEl).toBeChecked();
  });

  it("calls onCheckedChange with the new value", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch label="Enable notifications" onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("switch", { name: "Enable notifications" }));
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
  });

  it("supports keyboard activation (Space)", async () => {
    const user = userEvent.setup();
    render(<Switch label="Enable notifications" />);

    const switchEl = screen.getByRole("switch", { name: "Enable notifications" });
    switchEl.focus();
    await user.keyboard(" ");

    expect(switchEl).toBeChecked();
  });

  it("blocks interaction when disabled", async () => {
    const onCheckedChange = vi.fn();
    const user = userEvent.setup();
    render(<Switch label="Enable notifications" disabled onCheckedChange={onCheckedChange} />);

    await user.click(screen.getByRole("switch", { name: "Enable notifications" }));
    expect(onCheckedChange).not.toHaveBeenCalled();
  });

  it("has no axe violations across all states", async () => {
    const { container } = render(
      <div>
        <Switch label="Off" />
        <Switch label="On" defaultChecked />
        <Switch label="Disabled" disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
