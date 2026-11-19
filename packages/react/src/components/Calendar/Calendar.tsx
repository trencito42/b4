import { forwardRef, useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { IconButton } from "../IconButton/IconButton.js";
import { WEEKDAY_LABELS, monthYearFormatter, sameDay, startOfMonth, addMonths, addDays, buildMonthGrid } from "../../internal/monthGrid.js";

export type CalendarEventTone = "neutral" | "success" | "warning" | "danger" | "info";

export interface CalendarEvent {
  id: string;
  date: Date;
  label: string;
  tone?: CalendarEventTone;
}

export interface CalendarProps {
  events?: CalendarEvent[];
  /** The month to display (any date within it). Controlled. */
  month?: Date;
  defaultMonth?: Date;
  onMonthChange?: (month: Date) => void;
  onDateSelect?: (date: Date) => void;
  /** Events per day beyond this many collapse into a "+N more" label. Defaults to 3. */
  maxEventsPerDay?: number;
  className?: string;
}

/**
 * A read/display month calendar — events laid out on a day grid, for
 * browsing a schedule. Distinct from `DatePicker`'s input-picker grid
 * (that one lives in a popover and exists to produce a single chosen
 * date for a form field; this one is the page content itself and shows
 * events, not just numbers). Reuses `DatePicker`'s month-grid date math
 * from `internal/monthGrid.ts` rather than re-deriving it — only the
 * keyboard-handling glue differs (no popover to close, no min/max
 * range), so it stays local, following the same arrow-key/PageUp/
 * PageDown pattern by convention, same ARIA APG grid pattern as
 * DatePicker (`role="grid"`/`"row"`/`"gridcell"`, roving tabindex).
 */
export const Calendar = forwardRef<HTMLDivElement, CalendarProps>(function Calendar(
  {
    events = [],
    month: controlledMonth,
    defaultMonth,
    onMonthChange,
    onDateSelect,
    maxEventsPerDay = 3,
    className,
  },
  ref,
) {
  const [uncontrolledMonth, setUncontrolledMonth] = useState(() => startOfMonth(defaultMonth ?? new Date()));
  const visibleMonth = controlledMonth !== undefined ? startOfMonth(controlledMonth) : uncontrolledMonth;
  const [focusedDate, setFocusedDate] = useState(() => defaultMonth ?? controlledMonth ?? new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  const gridId = useId();

  const setVisibleMonth = (next: Date) => {
    if (controlledMonth === undefined) setUncontrolledMonth(startOfMonth(next));
    onMonthChange?.(startOfMonth(next));
  };

  // Same reasoning as DatePicker: a cross-month focus move re-renders a
  // different set of day buttons, which don't exist in the DOM yet in
  // the same tick as the state update that changed visibleMonth — focus
  // from an effect keyed on focusedDate, not synchronously in the
  // keydown handler, so it runs after React has actually re-rendered.
  useEffect(() => {
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focusedDate.toDateString()}"]`)?.focus();
  }, [focusedDate]);

  function moveFocus(next: Date) {
    setFocusedDate(next);
    if (next.getMonth() !== visibleMonth.getMonth() || next.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(next);
    }
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const deltas: Record<string, number> = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -7, ArrowDown: 7 };
    if (event.key in deltas) {
      event.preventDefault();
      moveFocus(addDays(focusedDate, deltas[event.key]!));
      return;
    }
    if (event.key === "PageUp") {
      event.preventDefault();
      moveFocus(addMonths(focusedDate, -1));
      return;
    }
    if (event.key === "PageDown") {
      event.preventDefault();
      moveFocus(addMonths(focusedDate, 1));
      return;
    }
    if (event.key === "Home") {
      event.preventDefault();
      moveFocus(addDays(focusedDate, -focusedDate.getDay()));
      return;
    }
    if (event.key === "End") {
      event.preventDefault();
      moveFocus(addDays(focusedDate, 6 - focusedDate.getDay()));
      return;
    }
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      onDateSelect?.(focusedDate);
    }
  }

  const grid = buildMonthGrid(visibleMonth);
  const eventsByDay = new Map<string, CalendarEvent[]>();
  for (const event of events) {
    const key = event.date.toDateString();
    const list = eventsByDay.get(key) ?? [];
    list.push(event);
    eventsByDay.set(key, list);
  }

  return (
    <div ref={ref} className={["b4-calendar", className ?? ""].filter(Boolean).join(" ")}>
      <div className="b4-calendar__header">
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Previous month"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
          icon={<ChevronIcon direction="left" />}
        />
        <span id={gridId} className="b4-calendar__month-label" aria-live="polite">
          {monthYearFormatter.format(visibleMonth)}
        </span>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Next month"
          onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
          icon={<ChevronIcon direction="right" />}
        />
      </div>
      <div ref={gridRef} role="grid" aria-labelledby={gridId} className="b4-calendar__grid" onKeyDown={handleGridKeyDown}>
        <div role="row" className="b4-calendar__weekday-row">
          {WEEKDAY_LABELS.map((day) => (
            <span key={day} role="columnheader" className="b4-calendar__weekday">
              {day}
            </span>
          ))}
        </div>
        {Array.from({ length: 6 }, (_, week) => (
          <div role="row" key={week} className="b4-calendar__week">
            {grid.slice(week * 7, week * 7 + 7).map((date) => {
              const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
              const isFocusTarget = sameDay(date, focusedDate);
              const dayEvents = eventsByDay.get(date.toDateString()) ?? [];
              const visibleEvents = dayEvents.slice(0, maxEventsPerDay);
              const overflowCount = dayEvents.length - visibleEvents.length;
              return (
                <span role="gridcell" key={date.toDateString()} className="b4-calendar__cell">
                  <button
                    type="button"
                    data-date={date.toDateString()}
                    tabIndex={isFocusTarget ? 0 : -1}
                    aria-current={sameDay(date, new Date()) ? "date" : undefined}
                    className={["b4-calendar__day", !isCurrentMonth ? "b4-calendar__day--outside" : ""].filter(Boolean).join(" ")}
                    onClick={() => {
                      setFocusedDate(date);
                      onDateSelect?.(date);
                    }}
                    onFocus={() => setFocusedDate(date)}
                  >
                    {/* Visually hidden, not aria-hidden: supplements the visible day
                        number with full date context for the accessible name. The
                        event labels below are real visible text, so they stay in
                        the natural accessible-name computation too (never
                        aria-hidden) — WCAG 2.5.3 "Label in Name": a sighted
                        voice-control user who sees "Standup" printed on the day
                        must be able to invoke it by saying "Standup", which an
                        aria-label replacing the whole name would silently break. */}
                    <span className="b4-calendar__day-context">
                      {date.toLocaleDateString(undefined, { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
                    </span>
                    <span className="b4-calendar__day-number">{date.getDate()}</span>
                    {visibleEvents.length > 0 && (
                      <span className="b4-calendar__events">
                        {visibleEvents.map((event) => (
                          <span key={event.id} className={`b4-calendar__event b4-calendar__event--${event.tone ?? "neutral"}`}>
                            {event.label}
                          </span>
                        ))}
                        {overflowCount > 0 && <span className="b4-calendar__event-overflow">+{overflowCount} more</span>}
                      </span>
                    )}
                  </button>
                </span>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
});

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path d={direction === "left" ? "m10 4-4 4 4 4" : "m6 4 4 4-4 4"} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
