import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DatePicker } from "./DatePicker";

// A fixed anchor date, supplied via `defaultValue` rather than mocking the
// system clock (`vi.useFakeTimers()` hung every interaction here — Popover's
// own internal timers/positioning never resolved under it, a real
// incompatibility between fake timers and this composition, not worth
// fighting when `defaultValue` gives the same determinism for free).
const ANCHOR = new Date(2026, 10, 18); // Nov 18, 2026 (Wednesday)

describe("DatePicker", () => {
  it("shows the placeholder until a date is selected", () => {
    render(<DatePicker label="Appointment date" />);
    expect(screen.getByRole("button", { name: "Appointment date Select a date" })).toBeInTheDocument();
  });

  it("opens the calendar grid when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(<DatePicker label="Appointment date" defaultValue={ANCHOR} />);

    await user.click(screen.getByRole("button", { name: /Nov 18, 2026/ }));
    expect(await screen.findByRole("grid")).toBeInTheDocument();
    expect(screen.getByText("November 2026")).toBeInTheDocument();
  });

  it("selects a day on click, closes, and updates the trigger label", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker label="Appointment date" defaultValue={ANCHOR} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: /Nov 18, 2026/ }));
    const grid = await screen.findByRole("grid");
    const day20 = grid.querySelector<HTMLElement>(`[data-date="${new Date(2026, 10, 20).toDateString()}"]`)!;
    await user.click(day20);

    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 10, 20));
    expect(await screen.findByText(/Nov 20, 2026/)).toBeInTheDocument();
  });

  it("navigates to the next/previous month with the header buttons", async () => {
    const user = userEvent.setup();
    render(<DatePicker label="Appointment date" defaultValue={ANCHOR} />);

    await user.click(screen.getByRole("button", { name: /Nov 18, 2026/ }));
    await screen.findByRole("grid");
    expect(screen.getByText("November 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("December 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("October 2026")).toBeInTheDocument();
  });

  it("moves focus a day at a time with arrow keys and selects with Enter", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<DatePicker label="Appointment date" defaultValue={ANCHOR} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: /Nov 18, 2026/ }));
    const grid = await screen.findByRole("grid");
    const start = grid.querySelector<HTMLElement>(`[data-date="${ANCHOR.toDateString()}"]`)!;
    start.focus();

    await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");

    expect(onValueChange).toHaveBeenCalledWith(new Date(2026, 10, 20));
  });

  it("does not allow selecting a date outside minDate/maxDate", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DatePicker
        label="Appointment date"
        defaultValue={ANCHOR}
        onValueChange={onValueChange}
        minDate={new Date(2026, 10, 10)}
        maxDate={new Date(2026, 10, 25)}
      />,
    );

    await user.click(screen.getByRole("button", { name: /Nov 18, 2026/ }));
    const grid = await screen.findByRole("grid");
    const outOfRangeDay = grid.querySelector<HTMLElement>(`[data-date="${new Date(2026, 10, 1).toDateString()}"]`)!;
    expect(outOfRangeDay).toHaveAttribute("aria-disabled", "true");

    await user.click(outOfRangeDay);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("has no axe violations while the calendar is open", async () => {
    const user = userEvent.setup();
    const { container } = render(<DatePicker label="Appointment date" defaultValue={ANCHOR} />);
    await user.click(screen.getByRole("button", { name: /Nov 18, 2026/ }));
    await screen.findByRole("grid");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
