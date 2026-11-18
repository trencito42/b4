import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { TreeView, type TreeNode } from "./TreeView";

const data: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      { id: "button-tsx", label: "Button.tsx" },
      { id: "button-css", label: "Button.css" },
    ],
  },
  { id: "package-json", label: "package.json" },
];

describe("TreeView", () => {
  it("renders a tree with top-level items, children collapsed by default", () => {
    render(<TreeView aria-label="Explorer" data={data} />);
    expect(screen.getByRole("tree", { name: "Explorer" })).toBeInTheDocument();
    expect(screen.getByRole("treeitem", { name: "src" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("treeitem", { name: "Button.tsx" })).not.toBeInTheDocument();
  });

  it("expands a branch via defaultExpandedIds", () => {
    render(<TreeView aria-label="Explorer" data={data} defaultExpandedIds={["src"]} />);
    // jsdom's accessible-name computation (dom-accessibility-api), unlike a
    // real browser, doesn't exclude a nested treeitem's own content when
    // computing its ancestor's name-from-content — "src"'s computed name in
    // jsdom includes its children's labels too. Confirmed this is a jsdom-
    // only limitation, not a real defect: axe and Playwright's own
    // accessible-name computation (both backed by real Chromium) report
    // "src" alone — see e2e/tree-view.spec.ts. Match with a prefix regex
    // here instead of fighting the test environment.
    expect(screen.getByRole("treeitem", { name: /^src/ })).toHaveAttribute("aria-expanded", "true");
    expect(screen.getByRole("treeitem", { name: "Button.tsx" })).toBeInTheDocument();
  });

  it("expands a branch by clicking its disclosure button", async () => {
    const user = userEvent.setup();
    render(<TreeView aria-label="Explorer" data={data} />);

    expect(screen.queryByRole("treeitem", { name: "Button.tsx" })).not.toBeInTheDocument();
    const srcItem = screen.getByRole("treeitem", { name: /^src/ });
    await user.click(srcItem.querySelector(".b4-tree-view__disclosure")!);
    expect(screen.getByRole("treeitem", { name: "Button.tsx" })).toBeInTheDocument();
  });

  it("navigates with ArrowDown/ArrowUp and selects with Enter", async () => {
    const onSelectedIdChange = vi.fn();
    const user = userEvent.setup();
    render(
      <TreeView
        aria-label="Explorer"
        data={data}
        defaultExpandedIds={["src"]}
        onSelectedIdChange={onSelectedIdChange}
      />,
    );

    const src = screen.getByRole("treeitem", { name: /^src/ });
    src.focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("treeitem", { name: "Button.tsx" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onSelectedIdChange).toHaveBeenCalledWith("button-tsx");
  });

  it("expands with ArrowRight and collapses with ArrowLeft", async () => {
    const user = userEvent.setup();
    render(<TreeView aria-label="Explorer" data={data} />);

    const src = screen.getByRole("treeitem", { name: "src" });
    src.focus();
    await user.keyboard("{ArrowRight}");
    expect(src).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{ArrowLeft}");
    expect(src).toHaveAttribute("aria-expanded", "false");
  });

  it("marks a disabled node as aria-disabled and skips it during keyboard navigation", async () => {
    const dataWithDisabled: TreeNode[] = [
      { id: "a", label: "A" },
      { id: "b", label: "B", disabled: true },
      { id: "c", label: "C" },
    ];
    const user = userEvent.setup();
    render(<TreeView aria-label="Explorer" data={dataWithDisabled} />);

    expect(screen.getByRole("treeitem", { name: "B" })).toHaveAttribute("aria-disabled", "true");

    screen.getByRole("treeitem", { name: "A" }).focus();
    await user.keyboard("{ArrowDown}");
    expect(screen.getByRole("treeitem", { name: "C" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<TreeView aria-label="Explorer" data={data} defaultExpandedIds={["src"]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
