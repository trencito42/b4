import { describe, expect, it, vi } from "vitest";
import { createRef } from "react";
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
    render(
      <Switch label="Enable notifications" disabled onCheckedChange={onCheckedChange} />,
    );

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

  it("preserves the same control, ref and keyboard focus under rapid changes", async () => {
    const user = userEvent.setup();
    const ref = createRef<HTMLButtonElement>();
    render(<Switch ref={ref} label="Notifications" />);
    const control = screen.getByRole("switch");
    await user.tab();
    for (let index = 0; index < 8; index++) await user.keyboard(" ");
    expect(control).not.toBeChecked();
    expect(control).toHaveFocus();
    expect(ref.current).toBe(control);
    expect(screen.getAllByRole("switch")).toHaveLength(1);
  });

  it("leaves selection with the controlled owner and submits its accepted value", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    const { container, rerender } = render(
      <form>
        <Switch
          label="Notifications"
          name="notifications"
          checked={false}
          onCheckedChange={onCheckedChange}
        />
      </form>,
    );
    const control = screen.getByRole("switch");
    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true, expect.anything());
    expect(control).not.toBeChecked();
    expect(new FormData(container.querySelector("form")!).has("notifications")).toBe(
      false,
    );
    rerender(
      <form>
        <Switch label="Notifications" name="notifications" checked />
      </form>,
    );
    expect(control).toBeChecked();
    expect(new FormData(container.querySelector("form")!).get("notifications")).toBe(
      "on",
    );
  });
});
