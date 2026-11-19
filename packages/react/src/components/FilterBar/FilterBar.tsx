import type { ReactNode } from "react";
import { Badge } from "../Badge/Badge.js";
import { Button } from "../Button/Button.js";

export interface ActiveFilter {
  id: string;
  label: ReactNode;
}

export interface FilterBarProps {
  /** The filter controls themselves — `Select`, `SearchField`, `Combobox`, etc. */
  children: ReactNode;
  /** Currently-applied filters, shown as removable chips below the controls. */
  activeFilters?: ActiveFilter[];
  onRemoveFilter?: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

const CloseIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M4 4l8 8M12 4l-8 8" strokeLinecap="round" />
  </svg>
);

/**
 * A row of filter controls (composes `Select`/`SearchField`/`Combobox`
 * — this component provides the layout and the applied-filter chip
 * trail, not another set of dropdown/input primitives) plus a trail of
 * removable chips showing what's currently applied, reusing `Badge`
 * for the chip itself rather than a new label component.
 */
export function FilterBar({ children, activeFilters = [], onRemoveFilter, onClearAll, className }: FilterBarProps) {
  return (
    <div className={["b4-filter-bar", className ?? ""].filter(Boolean).join(" ")}>
      <div className="b4-filter-bar__controls">{children}</div>
      {activeFilters.length > 0 && (
        <div className="b4-filter-bar__active">
          {/* role="list" may only contain role="listitem" children (a real
              axe violation when "Clear all" lived in here too) — the
              button sits as a sibling of the list, not inside it. */}
          <div role="list" aria-label="Active filters" className="b4-filter-bar__chips">
            {activeFilters.map((filter) => (
              <span role="listitem" key={filter.id} className="b4-filter-bar__chip">
                <Badge>
                  {filter.label}
                  {/* A bare button, not IconButton: IconButton's smallest
                      control-height (32px) is sized for standalone controls
                      and would badly overflow this chip's own ~22px height —
                      the chip needs its own compact, chip-scaled affordance. */}
                  <button
                    type="button"
                    aria-label={`Remove filter: ${typeof filter.label === "string" ? filter.label : filter.id}`}
                    onClick={() => onRemoveFilter?.(filter.id)}
                    className="b4-filter-bar__chip-remove"
                  >
                    {CloseIcon}
                  </button>
                </Badge>
              </span>
            ))}
          </div>
          {onClearAll && (
            <Button variant="ghost" size="sm" onClick={onClearAll}>
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
