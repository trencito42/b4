import { IconButton } from "../IconButton/IconButton.js";

export interface PaginationProps {
  /** 1-indexed current page. */
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  /** Required — the page-number buttons have no visible label of their own. */
  "aria-label": string;
  className?: string;
}

const PrevIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m10 4-4 4 4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const NextIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

/** First, last, current ± 1, with an ellipsis for any gap — never a flat list of 50 buttons. */
function getVisiblePages(page: number, totalPages: number): (number | "ellipsis")[] {
  const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);

  const result: (number | "ellipsis")[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const current = sorted[i]!;
    if (i > 0 && current - sorted[i - 1]! > 1) result.push("ellipsis");
    result.push(current);
  }
  return result;
}

/**
 * Real page navigation with a bounded button count (first/last/current
 * neighbors + ellipsis), not every page number rendered flat. Built on
 * plain buttons with `aria-current="page"` — no Base UI primitive
 * exists for pagination specifically.
 */
export function Pagination({ page, totalPages, onPageChange, className, ...rest }: PaginationProps) {
  const visiblePages = getVisiblePages(page, totalPages);

  return (
    <nav className={["b4-pagination", className ?? ""].filter(Boolean).join(" ")} {...rest}>
      <IconButton
        variant="ghost"
        size="sm"
        icon={PrevIcon}
        aria-label="Previous page"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      {visiblePages.map((item, index) =>
        item === "ellipsis" ? (
          <span className="b4-pagination__ellipsis" key={`ellipsis-${index}`} aria-hidden="true">
            …
          </span>
        ) : (
          <button
            key={item}
            type="button"
            className="b4-pagination__page"
            aria-current={item === page ? "page" : undefined}
            onClick={() => onPageChange(item)}
          >
            {item}
          </button>
        ),
      )}
      <IconButton
        variant="ghost"
        size="sm"
        icon={NextIcon}
        aria-label="Next page"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}
