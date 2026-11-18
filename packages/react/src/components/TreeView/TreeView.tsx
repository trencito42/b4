import { useMemo, useRef, useState, type CSSProperties, type KeyboardEvent, type ReactNode } from "react";

export interface TreeNode {
  id: string;
  label: ReactNode;
  children?: readonly TreeNode[];
  disabled?: boolean;
}

export interface TreeViewProps {
  data: readonly TreeNode[];
  /** Required — the tree has no visible label of its own. */
  "aria-label": string;
  defaultExpandedIds?: readonly string[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  onSelectedIdChange?: (id: string | null) => void;
  className?: string;
}

const ChevronIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path d="m6 4 4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

interface FlatRow {
  node: TreeNode;
  parentId: string | null;
  hasChildren: boolean;
}

/** Depth-first list of every *visible* row, for keyboard navigation only — collapsed branches don't contribute their children. The rendered DOM nests real `role="group"` elements instead; this never drives markup. */
function flattenVisible(nodes: readonly TreeNode[], expanded: Set<string>, parentId: string | null): FlatRow[] {
  const rows: FlatRow[] = [];
  for (const node of nodes) {
    const hasChildren = !!node.children && node.children.length > 0;
    rows.push({ node, parentId, hasChildren });
    if (hasChildren && expanded.has(node.id)) {
      rows.push(...flattenVisible(node.children!, expanded, node.id));
    }
  }
  return rows;
}

/**
 * A real ARIA `tree` — `role="tree"`/`"treeitem"`/`"group"` with real
 * nested `<ul role="group">` markup for subtrees (more robust for
 * assistive tech than a flat list with `aria-level` alone), roving
 * `tabindex` (one real focusable item at a time, matching the
 * roving-focus convention every other composite widget in this library
 * uses, not `aria-activedescendant`), and the full ARIA APG tree
 * keyboard pattern: Right expands a collapsed branch or moves into its
 * first child; Left collapses an expanded branch or moves to its
 * parent; Up/Down move between visible rows; Home/End jump to the
 * first/last visible row. No Base UI primitive exists for this — built
 * from scratch, not a flattened list wearing tree-shaped CSS.
 */
export function TreeView({
  data,
  "aria-label": ariaLabel,
  defaultExpandedIds,
  selectedId: controlledSelectedId,
  defaultSelectedId,
  onSelectedIdChange,
  className,
}: TreeViewProps) {
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(defaultExpandedIds ?? []));
  const [uncontrolledSelectedId, setUncontrolledSelectedId] = useState<string | null>(defaultSelectedId ?? null);
  const selectedId = controlledSelectedId ?? uncontrolledSelectedId;
  const rootRef = useRef<HTMLUListElement>(null);

  const visibleRows = useMemo(() => flattenVisible(data, expanded, null), [data, expanded]);
  const enabledRows = visibleRows.filter((row) => !row.node.disabled);
  const [focusedId, setFocusedId] = useState<string | null>(() => enabledRows[0]?.node.id ?? null);
  const focusedExists = visibleRows.some((row) => row.node.id === focusedId && !row.node.disabled);
  const effectiveFocusedId = focusedExists ? focusedId : (enabledRows[0]?.node.id ?? null);

  function focusRow(id: string) {
    setFocusedId(id);
    // `.focus()` works on an element regardless of its current `tabindex`
    // value (tabindex only gates Tab-key reachability, not programmatic
    // focus), so this doesn't need to wait for React to re-render the
    // roving tabindex onto this element first.
    rootRef.current?.querySelector<HTMLElement>(`[data-tree-id="${CSS.escape(id)}"]`)?.focus();
  }

  function selectRow(id: string) {
    setUncontrolledSelectedId(id);
    onSelectedIdChange?.(id);
  }

  function toggleExpanded(id: string, next?: boolean) {
    setExpanded((prev) => {
      const copy = new Set(prev);
      const shouldExpand = next ?? !copy.has(id);
      if (shouldExpand) copy.add(id);
      else copy.delete(id);
      return copy;
    });
  }

  function handleKeyDown(event: KeyboardEvent<HTMLLIElement>, row: FlatRow) {
    // Each treeitem's `<li>` nests its children's `<li role="group">`
    // subtree inside itself, so a keydown fired on a descendant row
    // bubbles up through every ancestor row's own `onKeyDown` too. Without
    // this, a key handled by the focused row's handler gets re-handled
    // (and its focus/expand change overridden) by every ancestor in the
    // same bubble phase — confirmed as the actual cause of "ArrowDown
    // after expanding a branch doesn't move focus" via a real-browser
    // trace, not guessed.
    if (event.currentTarget !== event.target) return;
    const index = enabledRows.findIndex((r) => r.node.id === row.node.id);

    switch (event.key) {
      case "ArrowDown": {
        event.preventDefault();
        const next = enabledRows[index + 1];
        if (next) focusRow(next.node.id);
        break;
      }
      case "ArrowUp": {
        event.preventDefault();
        const prev = enabledRows[index - 1];
        if (prev) focusRow(prev.node.id);
        break;
      }
      case "ArrowRight": {
        event.preventDefault();
        if (row.hasChildren && !expanded.has(row.node.id)) {
          toggleExpanded(row.node.id, true);
        } else if (row.hasChildren) {
          const firstChild = row.node.children![0];
          if (firstChild) focusRow(firstChild.id);
        }
        break;
      }
      case "ArrowLeft": {
        event.preventDefault();
        if (row.hasChildren && expanded.has(row.node.id)) {
          toggleExpanded(row.node.id, false);
        } else if (row.parentId) {
          focusRow(row.parentId);
        }
        break;
      }
      case "Home": {
        event.preventDefault();
        const first = enabledRows[0];
        if (first) focusRow(first.node.id);
        break;
      }
      case "End": {
        event.preventDefault();
        const last = enabledRows[enabledRows.length - 1];
        if (last) focusRow(last.node.id);
        break;
      }
      case "Enter":
      case " ": {
        event.preventDefault();
        selectRow(row.node.id);
        break;
      }
      default:
        break;
    }
  }

  function renderNodes(nodes: readonly TreeNode[], level: number) {
    return nodes.map((node) => {
      const hasChildren = !!node.children && node.children.length > 0;
      const isExpanded = expanded.has(node.id);
      const row: FlatRow = { node, parentId: null, hasChildren };
      return (
        <li
          key={node.id}
          role="treeitem"
          data-tree-id={node.id}
          aria-expanded={hasChildren ? isExpanded : undefined}
          aria-selected={node.id === selectedId}
          aria-disabled={node.disabled || undefined}
          tabIndex={node.id === effectiveFocusedId && !node.disabled ? 0 : -1}
          className={[
            "b4-tree-view__item",
            node.id === selectedId ? "b4-tree-view__item--selected" : "",
            node.disabled ? "b4-tree-view__item--disabled" : "",
          ]
            .filter(Boolean)
            .join(" ")}
          style={{ "--tree-level": level } as CSSProperties}
          onFocus={() => !node.disabled && setFocusedId(node.id)}
          onClick={(event) => {
            event.stopPropagation();
            if (!node.disabled) selectRow(node.id);
          }}
          onKeyDown={(event) => handleKeyDown(event, row)}
        >
          <span className="b4-tree-view__row">
            {hasChildren ? (
              // A `<span>`, not a `<button>`: the row itself (`role="treeitem"`,
              // already keyboard-operable via Right/Left) is the single real
              // control here. A second *focusable* element doing the same
              // thing would need its own accessible name, and that name gets
              // folded into the row's name-from-content, turning "src" into
              // "Collapse src" for every assistive-tech user — confirmed via
              // a real Chromium accessibility snapshot, not assumed. Staying
              // non-focusable keeps `aria-hidden` here valid (WAI-ARIA
              // forbids `aria-hidden` on a focusable element) while still
              // giving mouse users a precise click target.
              <span
                className="b4-tree-view__disclosure"
                aria-hidden="true"
                onClick={(event) => {
                  event.stopPropagation();
                  toggleExpanded(node.id);
                }}
              >
                {ChevronIcon}
              </span>
            ) : (
              <span className="b4-tree-view__disclosure-spacer" aria-hidden="true" />
            )}
            <span className="b4-tree-view__label">{node.label}</span>
          </span>
          {hasChildren && isExpanded && (
            <ul role="group" className="b4-tree-view__group">
              {renderNodes(node.children!, level + 1)}
            </ul>
          )}
        </li>
      );
    });
  }

  return (
    <ul ref={rootRef} role="tree" aria-label={ariaLabel} className={["b4-tree-view", className ?? ""].filter(Boolean).join(" ")}>
      {renderNodes(data, 0)}
    </ul>
  );
}
