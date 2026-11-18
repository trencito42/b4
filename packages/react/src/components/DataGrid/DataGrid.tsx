import { useMemo, useRef, useState, type CSSProperties, type ReactNode, type UIEvent } from "react";
import { SearchField } from "../SearchField/SearchField.js";
import { EmptyState } from "../EmptyState/EmptyState.js";

export type SortDirection = "asc" | "desc";

export interface DataGridSort {
  columnKey: string;
  direction: SortDirection;
}

export interface DataGridColumn<Row> {
  key: string;
  header: ReactNode;
  /** The real, typed value — used for both sorting and the quick filter. This is what lets DataGrid sort/filter for real, unlike DataTable (which only sees each column's rendered output). */
  getValue: (row: Row) => string | number;
  /** Visual override for the cell. Defaults to `String(getValue(row))`. */
  render?: (row: Row) => ReactNode;
  width?: number;
  align?: "start" | "end";
}

export interface DataGridProps<Row> {
  columns: DataGridColumn<Row>[];
  rows: Row[];
  getRowId: (row: Row) => string;
  caption: ReactNode;
  hideCaption?: boolean;
  /** Viewport height in px — rows outside it aren't rendered to the DOM. Defaults to 360. */
  height?: number;
  /** Fixed row height in px, required for windowed virtualization math. Defaults to 40. */
  rowHeight?: number;
  sort?: DataGridSort;
  defaultSort?: DataGridSort;
  onSortChange?: (sort: DataGridSort | undefined) => void;
  filterValue?: string;
  defaultFilterValue?: string;
  onFilterChange?: (value: string) => void;
  filterLabel?: string;
  className?: string;
}

const OVERSCAN = 4;

const SortIcon = ({ direction }: { direction: SortDirection | "none" }) => (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75} aria-hidden="true">
    {direction !== "desc" && (
      <path d="M5 6.5 8 3.5l3 3" strokeLinecap="round" strokeLinejoin="round" opacity={direction === "asc" ? 1 : 0.4} />
    )}
    {direction !== "asc" && (
      <path d="M5 9.5 8 12.5l3-3" strokeLinecap="round" strokeLinejoin="round" opacity={direction === "desc" ? 1 : 0.4} />
    )}
  </svg>
);

/**
 * A real virtualized, sortable, filterable grid — DataTable's heavier
 * sibling for data too large to render every row of. Uses ARIA
 * `grid`/`row`/`columnheader`/`gridcell` roles with a div-based layout
 * (not a native `<table>`): a real `<table>` requires every `<tr>` to be
 * a contiguous DOM child, which doesn't compose with windowed rendering
 * (only the rows currently scrolled into view, plus a small overscan
 * buffer, actually exist in the DOM — this is real row virtualization,
 * not a styled, fully-rendered `<table>` capped by `overflow`). Sorting
 * and filtering are genuine, driven by each column's `getValue` (not
 * DataTable's controlled-only, render-output-only approach), because a
 * `(row) => string | number` accessor is enough to compare and search
 * safely without knowing anything else about the row's shape.
 */
export function DataGrid<Row>({
  columns,
  rows,
  getRowId,
  caption,
  hideCaption = false,
  height = 360,
  rowHeight = 40,
  sort,
  defaultSort,
  onSortChange,
  filterValue,
  defaultFilterValue = "",
  onFilterChange,
  filterLabel = "Filter",
  className,
}: DataGridProps<Row>) {
  const [internalSort, setInternalSort] = useState<DataGridSort | undefined>(defaultSort);
  const [internalFilter, setInternalFilter] = useState(defaultFilterValue);
  const [scrollTop, setScrollTop] = useState(0);
  const viewportRef = useRef<HTMLDivElement>(null);

  const resolvedSort = sort !== undefined ? sort : internalSort;
  const resolvedFilter = filterValue !== undefined ? filterValue : internalFilter;

  // A sort or filter change re-orders/shrinks the row set under whatever
  // scroll position the viewport happened to be at — without resetting it,
  // the grid would silently keep showing rows from the middle of the old
  // list, which reads as broken (e.g. "I sorted by price and nothing
  // changed") rather than as a list that's now scrolled past its own top.
  const resetScroll = () => {
    setScrollTop(0);
    if (viewportRef.current) viewportRef.current.scrollTop = 0;
  };

  const setSort = (next: DataGridSort | undefined) => {
    if (sort === undefined) setInternalSort(next);
    onSortChange?.(next);
    resetScroll();
  };
  const setFilter = (next: string) => {
    if (filterValue === undefined) setInternalFilter(next);
    onFilterChange?.(next);
    resetScroll();
  };

  const filteredRows = useMemo(() => {
    const query = resolvedFilter.trim().toLowerCase();
    if (!query) return rows;
    return rows.filter((row) => columns.some((column) => String(column.getValue(row)).toLowerCase().includes(query)));
  }, [rows, columns, resolvedFilter]);

  const sortedRows = useMemo(() => {
    if (!resolvedSort) return filteredRows;
    const column = columns.find((c) => c.key === resolvedSort.columnKey);
    if (!column) return filteredRows;
    const dir = resolvedSort.direction === "asc" ? 1 : -1;
    return [...filteredRows].sort((a, b) => {
      const va = column.getValue(a);
      const vb = column.getValue(b);
      if (typeof va === "number" && typeof vb === "number") return (va - vb) * dir;
      return String(va).localeCompare(String(vb)) * dir;
    });
  }, [filteredRows, resolvedSort, columns]);

  const handleSort = (columnKey: string) => {
    const next: DataGridSort =
      resolvedSort?.columnKey === columnKey && resolvedSort.direction === "asc"
        ? { columnKey, direction: "desc" }
        : { columnKey, direction: "asc" };
    setSort(next);
  };

  const handleScroll = (event: UIEvent<HTMLDivElement>) => setScrollTop(event.currentTarget.scrollTop);

  const visibleCount = Math.ceil(height / rowHeight) + OVERSCAN * 2;
  const startIndex = Math.max(0, Math.floor(scrollTop / rowHeight) - OVERSCAN);
  const endIndex = Math.min(sortedRows.length, startIndex + visibleCount);
  const visibleRows = sortedRows.slice(startIndex, endIndex);
  const totalHeight = sortedRows.length * rowHeight;

  return (
    <div className={["b4-data-grid", className ?? ""].filter(Boolean).join(" ")}>
      <div className="b4-data-grid__toolbar">
        <p className={["b4-data-grid__caption", hideCaption ? "b4-data-grid__caption--hidden" : ""].filter(Boolean).join(" ")}>
          {caption}
        </p>
        <SearchField
          label={filterLabel}
          hideLabel
          placeholder={filterLabel}
          value={resolvedFilter}
          onValueChange={setFilter}
          className="b4-data-grid__filter"
        />
      </div>
      <div
        ref={viewportRef}
        role="grid"
        aria-label={typeof caption === "string" ? caption : undefined}
        aria-rowcount={sortedRows.length + 1}
        aria-colcount={columns.length}
        className="b4-data-grid__viewport"
        style={{ height }}
        onScroll={handleScroll}
      >
        <div role="row" aria-rowindex={1} className="b4-data-grid__header-row" style={{ "--b4-data-grid-columns": columns.length } as CSSProperties}>
          {columns.map((column) => {
            const isSorted = resolvedSort?.columnKey === column.key;
            return (
              <span
                key={column.key}
                role="columnheader"
                aria-sort={isSorted ? (resolvedSort!.direction === "asc" ? "ascending" : "descending") : "none"}
                className={["b4-data-grid__header-cell", column.align === "end" ? "b4-data-grid__cell--end" : ""].filter(Boolean).join(" ")}
                style={{ width: column.width }}
              >
                <button type="button" className="b4-data-grid__sort-button" onClick={() => handleSort(column.key)}>
                  {column.header}
                  <SortIcon direction={isSorted ? resolvedSort!.direction : "none"} />
                </button>
              </span>
            );
          })}
        </div>
        {sortedRows.length === 0 ? (
          <div className="b4-data-grid__empty">
            <EmptyState title="No matching rows" description={resolvedFilter ? `Nothing matches "${resolvedFilter}".` : undefined} />
          </div>
        ) : (
          <div className="b4-data-grid__spacer" style={{ height: totalHeight }}>
            {visibleRows.map((row, i) => {
              const index = startIndex + i;
              const id = getRowId(row);
              return (
                <div
                  key={id}
                  role="row"
                  aria-rowindex={index + 2}
                  className="b4-data-grid__row"
                  style={{ "--b4-data-grid-columns": columns.length, top: index * rowHeight, height: rowHeight } as CSSProperties}
                >
                  {columns.map((column) => (
                    <span
                      key={column.key}
                      role="gridcell"
                      className={["b4-data-grid__cell", column.align === "end" ? "b4-data-grid__cell--end" : ""].filter(Boolean).join(" ")}
                      style={{ width: column.width }}
                    >
                      {column.render ? column.render(row) : String(column.getValue(row))}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
