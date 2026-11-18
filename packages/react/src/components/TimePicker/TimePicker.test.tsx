import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TimePicker } from "./TimePicker";

describe("TimePicker", () => {
  it("shows the hour, minute, and AM/PM for a given value, zero-padded", () => {
    render(<TimePicker label="Reminder time" value={{ hours: 9, minutes: 5 }} onValueChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Hours" })).toHaveValue("09");
    expect(screen.getByRole("textbox", { name: "Minutes" })).toHaveValue("05");
    expect(screen.getByRole("button", { name: "AM", pressed: true })).toBeInTheDocument();
  });

  it("converts 24-hour values to 12-hour display with the correct AM/PM", () => {
    render(<TimePicker label="Reminder time" value={{ hours: 14, minutes: 30 }} onValueChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Hours" })).toHaveValue("02");
    expect(screen.getByRole("button", { name: "PM", pressed: true })).toBeInTheDocument();
  });

  it("supports uncontrolled use via defaultValue, updating on interaction", async () => {
    const user = userEvent.setup();
    render(<TimePicker label="Reminder time" defaultValue={{ hours: 10, minutes: 0 }} />);

    await user.click(screen.getByRole("button", { name: "Increase hours" }));
    expect(screen.getByRole("textbox", { name: "Hours" })).toHaveValue("11");
  });

  it("steps hours and minutes with the increment/decrement buttons", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TimePicker
        label="Reminder time"
        value={{ hours: 9, minutes: 5 }}
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Increase minutes" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ hours: 9, minutes: 6 });

    await user.click(screen.getByRole("button", { name: "Decrease hours" }));
    expect(onValueChange).toHaveBeenLastCalledWith({ hours: 8, minutes: 5 });
  });

  it("clamps hour stepping at 1-12 (12-hour mode) without wrapping", async () => {
    // Uncontrolled (via defaultValue) so each click's effect is visible in
    // the next render — a controlled instance with a static `value` prop
    // and a mock `onValueChange` never re-renders between clicks.
    const user = userEvent.setup();
    render(<TimePicker label="Reminder time" defaultValue={{ hours: 11, minutes: 0 }} />);

    // 11:00 PM -> hour12 is 11; incrementing should clamp at 12, never wrap to 1.
    const increment = screen.getByRole("button", { name: "Increase hours" });
    await user.click(increment);
    expect(screen.getByRole("textbox", { name: "Hours" })).toHaveValue("12");
    await user.click(increment);
    expect(screen.getByRole("textbox", { name: "Hours" })).toHaveValue("12");
  });

  it("switches AM/PM, converting the 24-hour value accordingly", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<TimePicker label="Reminder time" value={{ hours: 9, minutes: 30 }} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "PM" }));
    expect(onValueChange).toHaveBeenCalledWith({ hours: 21, minutes: 30 });
  });

  it("supports a real 24-hour mode with no AM/PM control", () => {
    render(<TimePicker label="Reminder time" use24Hour value={{ hours: 14, minutes: 30 }} onValueChange={() => {}} />);
    expect(screen.getByRole("textbox", { name: "Hours" })).toHaveValue("14");
    expect(screen.queryByRole("button", { name: "AM" })).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <TimePicker label="Reminder time" value={{ hours: 9, minutes: 5 }} onValueChange={() => {}} />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
