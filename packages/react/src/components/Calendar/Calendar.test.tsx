import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Calendar, type CalendarEvent } from "./Calendar";

const ANCHOR = new Date(2026, 10, 18); // Nov 18, 2026 (Wednesday)

const events: CalendarEvent[] = [
  { id: "1", date: new Date(2026, 10, 18), label: "Standup", tone: "info" },
  { id: "2", date: new Date(2026, 10, 18), label: "Launch review", tone: "danger" },
  { id: "3", date: new Date(2026, 10, 20), label: "A", tone: "neutral" },
  { id: "4", date: new Date(2026, 10, 20), label: "B", tone: "neutral" },
  { id: "5", date: new Date(2026, 10, 20), label: "C", tone: "neutral" },
  { id: "6", date: new Date(2026, 10, 20), label: "D", tone: "neutral" },
];

describe("Calendar", () => {
  it("renders the visible month label and a real ARIA grid", () => {
    render(<Calendar defaultMonth={ANCHOR} />);
    expect(screen.getByText("November 2026")).toBeInTheDocument();
    expect(screen.getByRole("grid")).toBeInTheDocument();
  });

  it("navigates to the next/previous month with the header buttons", async () => {
    const user = userEvent.setup();
    render(<Calendar defaultMonth={ANCHOR} />);

    await user.click(screen.getByRole("button", { name: "Next month" }));
    expect(screen.getByText("December 2026")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Previous month" }));
    await user.click(screen.getByRole("button", { name: "Previous month" }));
    expect(screen.getByText("October 2026")).toBeInTheDocument();
  });

  it("moves focus a day at a time with arrow keys and reports selection on Enter", async () => {
    const onDateSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultMonth={ANCHOR} onDateSelect={onDateSelect} />);

    const grid = container.querySelector('[role="grid"]')!;
    const start = grid.querySelector<HTMLElement>(`[data-date="${ANCHOR.toDateString()}"]`)!;
    start.focus();

    await user.keyboard("{ArrowRight}{ArrowRight}{Enter}");

    expect(onDateSelect).toHaveBeenCalledWith(new Date(2026, 10, 20));
  });

  it("reports selection when a day is clicked", async () => {
    const onDateSelect = vi.fn();
    const user = userEvent.setup();
    const { container } = render(<Calendar defaultMonth={ANCHOR} onDateSelect={onDateSelect} />);

    const grid = container.querySelector('[role="grid"]')!;
    const day20 = grid.querySelector<HTMLElement>(`[data-date="${new Date(2026, 10, 20).toDateString()}"]`)!;
    await user.click(day20);

    expect(onDateSelect).toHaveBeenCalledWith(new Date(2026, 10, 20));
  });

  it("renders each day's events as real visible text, not color alone", () => {
    render(<Calendar defaultMonth={ANCHOR} events={events} />);
    expect(screen.getByText("Standup")).toBeInTheDocument();
    expect(screen.getByText("Launch review")).toBeInTheDocument();
  });

  it("collapses events beyond maxEventsPerDay into a '+N more' label", () => {
    render(<Calendar defaultMonth={ANCHOR} events={events} maxEventsPerDay={2} />);
    expect(screen.getByText("A")).toBeInTheDocument();
    expect(screen.getByText("B")).toBeInTheDocument();
    expect(screen.queryByText("C")).toBeNull();
    expect(screen.getByText("+2 more")).toBeInTheDocument();
  });

  it("includes the visible event labels in the day's accessible name, not just a count (WCAG 2.5.3)", () => {
    render(<Calendar defaultMonth={ANCHOR} events={events} />);
    const day18 = screen.getByRole("button", { name: /November 18, 2026/ });
    expect(day18).toHaveAccessibleName(/Standup/);
    expect(day18).toHaveAccessibleName(/Launch review/);
  });

  it("marks today with aria-current", () => {
    const today = new Date();
    const { container } = render(<Calendar defaultMonth={today} />);
    const grid = container.querySelector('[role="grid"]')!;
    const todayCell = grid.querySelector<HTMLElement>(`[data-date="${today.toDateString()}"]`)!;
    expect(todayCell).toHaveAttribute("aria-current", "date");
  });

  it("has no axe violations with events rendered", async () => {
    const { container } = render(<Calendar defaultMonth={ANCHOR} events={events} />);
    const results = await axe(container, { rules: { region: { enabled: false } } });
    expect(results).toHaveNoViolations();
  });
});
