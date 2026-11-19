import type { ReactNode } from "react";
import { Checkbox } from "../Checkbox/Checkbox.js";

export type SortDirection = "asc" | "desc";

export interface DataTableSort {
  columnKey: string;
  direction: SortDirection;
}

export interface DataTableColumn<Row> {
  key: string;
  header: ReactNode;
  /** Defaults to stringifying `row[key]` when omitted. */
  render?: (row: Row) => ReactNode;
  sortable?: boolean;
  align?: "start" | "end";
}

export interface DataTableProps<Row> {
  columns: DataTableColumn<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  /** Used for each row-selection checkbox's accessible label, e.g. "Ada Lovelace". Defaults to the row id. */
  getRowLabel?: (row: Row) => string;
  /** A visible or screen-reader-only summary of the table's purpose — required for real `<table>` semantics, not decorative. */
  caption: ReactNode;
  hideCaption?: boolean;
  /** Fully controlled — DataTable renders `rows` in the order given and reports clicks; it does not sort data itself (see the component doc comment for why). */
  sort?: DataTableSort;
  onSortChange?: (sort: DataTableSort) => void;
  selectedIds?: Set<string>;
  onSelectedIdsChange?: (ids: Set<string>) => void;
  className?: string;
}

const SortIcon = ({ direction }: { direction: SortDirection | "none" }) => (
  <svg
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.75}
    aria-hidden="true"
  >
    {direction !== "desc" && (
      <path
        d="M5 6.5 8 3.5l3 3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "asc" ? 1 : 0.4}
      />
    )}
    {direction !== "asc" && (
      <path
        d="M5 9.5 8 12.5l3-3"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity={direction === "desc" ? 1 : 0.4}
      />
    )}
  </svg>
);

/**
 * A real `<table>`-semantics data table with sortable-column affordance
 * and row selection — DataGrid's lighter sibling for data that doesn't
 * need virtualization. Sorting is fully controlled (`sort` +
 * `onSortChange`): DataTable only knows each column's rendered content,
 * not its underlying value type, so it can't sort generically without
 * either requiring a comparator per column or silently stringifying
 * everything (both worse than just letting the consumer, who knows the
 * real types, do it). `DataGrid` is where virtualized, in-component
 * sort/filter belongs.
 */
export function DataTable<Row>({
  columns,
  rows,
  getRowId,
  getRowLabel,
  caption,
  hideCaption = false,
  sort,
  onSortChange,
  selectedIds,
  onSelectedIdsChange,
  className,
}: DataTableProps<Row>) {
  const selectable = selectedIds !== undefined && onSelectedIdsChange !== undefined;
  const allIds = rows.map(getRowId);
  const allSelected =
    selectable && allIds.length > 0 && allIds.every((id) => selectedIds!.has(id));
  const someSelected =
    selectable && !allSelected && allIds.some((id) => selectedIds!.has(id));

  const toggleAll = (checked: boolean) => {
    if (!selectable) return;
    const next = new Set(selectedIds);
    for (const id of allIds) {
      if (checked) next.add(id);
      else next.delete(id);
    }
    onSelectedIdsChange!(next);
  };

  const toggleRow = (id: string, checked: boolean) => {
    if (!selectable) return;
    const next = new Set(selectedIds);
    if (checked) next.add(id);
    else next.delete(id);
    onSelectedIdsChange!(next);
  };

  const handleSort = (columnKey: string) => {
    if (!onSortChange) return;
    const direction: SortDirection =
      sort?.columnKey === columnKey && sort.direction === "asc" ? "desc" : "asc";
    onSortChange({ columnKey, direction });
  };

  return (
    <div
      className="b4-data-table__scroll"
      tabIndex={0}
      role="region"
      aria-label={
        typeof caption === "string" ? `${caption} scroll area` : "Table scroll area"
      }
    >
      <table className={["b4-data-table", className ?? ""].filter(Boolean).join(" ")}>
        <caption
          className={[
            "b4-data-table__caption",
            hideCaption ? "b4-data-table__caption--hidden" : "",
          ]
            .filter(Boolean)
            .join(" ")}
        >
          {caption}
        </caption>
        <thead>
          <tr>
            {selectable && (
              <th scope="col" className="b4-data-table__select-cell">
                <Checkbox
                  checked={allSelected}
                  indeterminate={someSelected}
                  onCheckedChange={toggleAll}
                  aria-label="Select all rows"
                  disabled={allIds.length === 0}
                />
              </th>
            )}
            {columns.map((column) => {
              const isSorted = sort?.columnKey === column.key;
              const ariaSort = isSorted
                ? sort!.direction === "asc"
                  ? "ascending"
                  : "descending"
                : undefined;
              return (
                <th
                  key={column.key}
                  scope="col"
                  aria-sort={column.sortable ? (ariaSort ?? "none") : undefined}
                  className={[
                    "b4-data-table__header",
                    column.align === "end" ? "b4-data-table__header--end" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {column.sortable ? (
                    <button
                      type="button"
                      className="b4-data-table__sort-button"
                      onClick={() => handleSort(column.key)}
                    >
                      {column.header}
                      <SortIcon direction={isSorted ? sort!.direction : "none"} />
                    </button>
                  ) : (
                    column.header
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => {
            const id = getRowId(row);
            const isSelected = selectable && selectedIds!.has(id);
            return (
              <tr key={id} data-selected={isSelected || undefined}>
                {selectable && (
                  <td className="b4-data-table__select-cell">
                    <Checkbox
                      checked={isSelected}
                      onCheckedChange={(checked) => toggleRow(id, checked)}
                      aria-label={`Select ${getRowLabel ? getRowLabel(row) : id}`}
                    />
                  </td>
                )}
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={
                      column.align === "end" ? "b4-data-table__cell--end" : undefined
                    }
                  >
                    {column.render
                      ? column.render(row)
                      : String((row as Record<string, unknown>)[column.key] ?? "")}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
