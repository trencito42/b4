import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";
import { Field } from "../Field/Field.js";
import { Popover } from "../Popover/Popover.js";
import { Button } from "../Button/Button.js";
import { IconButton } from "../IconButton/IconButton.js";

export interface DatePickerProps {
  label: string;
  hideLabel?: boolean;
  hint?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  placeholder?: string;
  value?: Date | null;
  defaultValue?: Date | null;
  onValueChange?: (date: Date | null) => void;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
}

const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, count: number) {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

function addDays(date: Date, count: number) {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

function isOutOfRange(date: Date, minDate?: Date, maxDate?: Date) {
  if (minDate && date < new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate())) return true;
  if (maxDate && date > new Date(maxDate.getFullYear(), maxDate.getMonth(), maxDate.getDate())) return true;
  return false;
}

/** The 6x7 day grid for the month containing `anchor`, including the trailing/leading days of neighboring months that fill out the first/last weeks. */
function buildMonthGrid(anchor: Date): Date[] {
  const firstOfMonth = startOfMonth(anchor);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}

const monthYearFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

/**
 * A real calendar — the ARIA APG "Date Picker Dialog" grid pattern
 * (`role="grid"`/`"row"`/`"gridcell"`, roving tabindex over day
 * buttons, arrow-key day/week navigation, PageUp/PageDown for month,
 * Home/End for the start/end of the visible week), not a native
 * `<input type="date">` wrapper or a text field with no real picker
 * behind it. The popup chrome is `Popover` — reused, not
 * reimplemented — closing automatically once a date is chosen.
 *
 * Scope note (see `COMPONENT_INVENTORY.md`): weeks start on Sunday and
 * there's no Shift+PageUp/PageDown year jump — a real simplification
 * for v1, not a silently dropped requirement.
 */
export function DatePicker({
  label,
  hideLabel,
  hint,
  error,
  disabled = false,
  required = false,
  placeholder = "Select a date",
  value: controlledValue,
  defaultValue,
  onValueChange,
  minDate,
  maxDate,
  className,
}: DatePickerProps) {
  const [uncontrolledValue, setUncontrolledValue] = useState<Date | null>(defaultValue ?? null);
  const value = controlledValue !== undefined ? controlledValue : uncontrolledValue;
  const [open, setOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(value ?? new Date()));
  const [focusedDate, setFocusedDate] = useState(() => value ?? new Date());
  const gridRef = useRef<HTMLDivElement>(null);
  const gridId = useId();

  function commit(date: Date) {
    if (isOutOfRange(date, minDate, maxDate)) return;
    setUncontrolledValue(date);
    onValueChange?.(date);
    setOpen(false);
  }

  // Unlike a same-month focus move, a cross-month move (PageUp/PageDown,
  // or an arrow key crossing a month boundary) changes `visibleMonth`,
  // which re-renders a different set of day buttons entirely — the
  // target button doesn't exist in the DOM yet in the same tick as the
  // `setVisibleMonth` call (React flushes the re-render after this
  // handler returns, not synchronously mid-handler). Focusing from a
  // `useEffect` keyed on `focusedDate` guarantees the DOM reflects the
  // new month before `.focus()` runs, with no `requestAnimationFrame`
  // guesswork (which both races React's own scheduling and breaks jsdom
  // tests — see the same lesson recorded for TreeView).
  useEffect(() => {
    if (!open) return;
    gridRef.current?.querySelector<HTMLElement>(`[data-date="${focusedDate.toDateString()}"]`)?.focus();
  }, [focusedDate, open]);

  function moveFocus(next: Date) {
    setFocusedDate(next);
    if (next.getMonth() !== visibleMonth.getMonth() || next.getFullYear() !== visibleMonth.getFullYear()) {
      setVisibleMonth(startOfMonth(next));
    }
  }

  function handleGridKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    const deltas: Record<string, number> = {
      ArrowLeft: -1,
      ArrowRight: 1,
      ArrowUp: -7,
      ArrowDown: 7,
    };
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
      commit(focusedDate);
    }
  }

  const grid = buildMonthGrid(visibleMonth);

  return (
    <Field label={label} hideLabel={hideLabel} hint={hint} error={error} disabled={disabled} required={required} className={className}>
      <Popover
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) {
            const anchor = value ?? new Date();
            setFocusedDate(anchor);
            setVisibleMonth(startOfMonth(anchor));
          }
        }}
        title={label}
        trigger={
          <Button variant="secondary" disabled={disabled} className="b4-date-picker__trigger">
            {value ? dateFormatter.format(value) : placeholder}
          </Button>
        }
      >
        <div className="b4-date-picker__calendar">
          <div className="b4-date-picker__header">
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Previous month"
              onClick={() => setVisibleMonth((m) => addMonths(m, -1))}
              icon={<ChevronIcon direction="left" />}
            />
            <span id={gridId} className="b4-date-picker__month-label" aria-live="polite">
              {monthYearFormatter.format(visibleMonth)}
            </span>
            <IconButton
              variant="ghost"
              size="sm"
              aria-label="Next month"
              onClick={() => setVisibleMonth((m) => addMonths(m, 1))}
              icon={<ChevronIcon direction="right" />}
            />
          </div>
          <div
            ref={gridRef}
            role="grid"
            aria-labelledby={gridId}
            className="b4-date-picker__grid"
            onKeyDown={handleGridKeyDown}
          >
            <div role="row" className="b4-date-picker__weekday-row">
              {WEEKDAY_LABELS.map((day) => (
                <span key={day} role="columnheader" className="b4-date-picker__weekday">
                  {day}
                </span>
              ))}
            </div>
            {Array.from({ length: 6 }, (_, week) => (
              <div role="row" key={week} className="b4-date-picker__week">
                {grid.slice(week * 7, week * 7 + 7).map((date) => {
                  const isCurrentMonth = date.getMonth() === visibleMonth.getMonth();
                  const isSelected = value ? sameDay(date, value) : false;
                  const isFocusTarget = sameDay(date, focusedDate);
                  const outOfRange = isOutOfRange(date, minDate, maxDate);
                  return (
                    <span role="gridcell" aria-selected={isSelected} key={date.toDateString()} className="b4-date-picker__cell">
                      <button
                        type="button"
                        data-date={date.toDateString()}
                        tabIndex={isFocusTarget ? 0 : -1}
                        aria-disabled={outOfRange || undefined}
                        aria-current={sameDay(date, new Date()) ? "date" : undefined}
                        className={[
                          "b4-date-picker__day",
                          !isCurrentMonth ? "b4-date-picker__day--outside" : "",
                          isSelected ? "b4-date-picker__day--selected" : "",
                          outOfRange ? "b4-date-picker__day--disabled" : "",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                        onClick={() => commit(date)}
                        onFocus={() => setFocusedDate(date)}
                      >
                        {date.getDate()}
                      </button>
                    </span>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </Popover>
    </Field>
  );
}

function ChevronIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
      <path
        d={direction === "left" ? "m10 4-4 4 4 4" : "m6 4 4 4-4 4"}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
