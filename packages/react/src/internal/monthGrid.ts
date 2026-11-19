/**
 * Shared month-grid date math — originally written for `DatePicker`,
 * reused as-is by `Calendar` rather than re-derived. Pure functions
 * only; no component-specific state or keyboard glue here (each
 * consumer's open/close and selection semantics differ enough that the
 * keyboard-handling itself stays local to each component, following
 * the same arrow-key/PageUp/PageDown pattern by convention).
 */

export const WEEKDAY_LABELS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export const monthYearFormatter = new Intl.DateTimeFormat(undefined, { month: "long", year: "numeric" });
export const dateFormatter = new Intl.DateTimeFormat(undefined, { dateStyle: "medium" });

export function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, count: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + count, 1);
}

export function addDays(date: Date, count: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + count);
  return next;
}

/** The 6x7 day grid for the month containing `anchor`, including the trailing/leading days of neighboring months that fill out the first/last weeks. */
export function buildMonthGrid(anchor: Date): Date[] {
  const firstOfMonth = startOfMonth(anchor);
  const gridStart = addDays(firstOfMonth, -firstOfMonth.getDay());
  return Array.from({ length: 42 }, (_, i) => addDays(gridStart, i));
}
