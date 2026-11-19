import { useMemo } from "react";
import { TreeView, type TreeNode } from "../TreeView/TreeView.js";

export interface FileExplorerNode {
  id: string;
  name: string;
  type: "file" | "folder";
  children?: FileExplorerNode[];
}

export interface FileExplorerProps {
  data: FileExplorerNode[];
  /** Required — the tree has no visible label of its own. */
  "aria-label": string;
  defaultExpandedIds?: readonly string[];
  selectedId?: string | null;
  defaultSelectedId?: string | null;
  /** Fires only for file nodes — selecting a folder navigates/highlights it but doesn't "open" anything, same distinction a real file browser makes. */
  onFileSelect?: (node: FileExplorerNode) => void;
  className?: string;
}

const FolderIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path d="M2 4.5a1 1 0 0 1 1-1h3.5l1.5 1.5H13a1 1 0 0 1 1 1V12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" strokeLinejoin="round" />
  </svg>
);

const FileIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden="true">
    <path d="M4 2h5l3 3v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V3a1 1 0 0 1 1-1Z" strokeLinejoin="round" />
    <path d="M9 2v3h3" strokeLinejoin="round" />
  </svg>
);

/** Folders before files, each group alphabetical — the universal file-browser sort convention. */
function sortEntries(nodes: FileExplorerNode[]): FileExplorerNode[] {
  return [...nodes].sort((a, b) => {
    if (a.type !== b.type) return a.type === "folder" ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
}

function toTreeNodes(nodes: FileExplorerNode[]): TreeNode[] {
  return sortEntries(nodes).map((node) => ({
    id: node.id,
    label: (
      <span className="b4-file-explorer__entry">
        <span className="b4-file-explorer__icon" aria-hidden="true">
          {node.type === "folder" ? FolderIcon : FileIcon}
        </span>
        {node.name}
      </span>
    ),
    children: node.children ? toTreeNodes(node.children) : undefined,
  }));
}

function findNode(nodes: FileExplorerNode[], id: string): FileExplorerNode | undefined {
  for (const node of nodes) {
    if (node.id === id) return node;
    if (node.children) {
      const found = findNode(node.children, id);
      if (found) return found;
    }
  }
  return undefined;
}

/**
 * A real file/folder tree, built on `TreeView` rather than reimplementing
 * tree keyboard navigation and ARIA semantics from scratch — folders
 * expand/collapse, files and folders sort folders-first then
 * alphabetically (the universal file-browser convention), and
 * `onFileSelect` fires only for file nodes, not folders.
 */
export function FileExplorer({ data, onFileSelect, className, ...rest }: FileExplorerProps) {
  const treeData = useMemo(() => toTreeNodes(data), [data]);

  return (
    <TreeView
      data={treeData}
      className={["b4-file-explorer", className ?? ""].filter(Boolean).join(" ")}
      onSelectedIdChange={(id) => {
        if (!id || !onFileSelect) return;
        const node = findNode(data, id);
        if (node?.type === "file") onFileSelect(node);
      }}
      {...rest}
    />
  );
}
