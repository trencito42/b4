import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { FileExplorer, type FileExplorerNode } from "./FileExplorer";

const data: FileExplorerNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [{ id: "index-ts", name: "index.ts", type: "file" }],
  },
  { id: "readme", name: "README.md", type: "file" },
];

describe("FileExplorer", () => {
  it("renders as a real tree with folders and files", () => {
    render(<FileExplorer data={data} aria-label="Project files" />);
    expect(screen.getByRole("tree", { name: "Project files" })).toBeInTheDocument();
    expect(screen.getByText("src")).toBeInTheDocument();
    expect(screen.getByText("README.md")).toBeInTheDocument();
  });

  it("sorts folders before files, alphabetically within each group", () => {
    const mixed: FileExplorerNode[] = [
      { id: "b", name: "b.txt", type: "file" },
      { id: "zfolder", name: "zfolder", type: "folder" },
      { id: "a", name: "a.txt", type: "file" },
      { id: "afolder", name: "afolder", type: "folder" },
    ];
    render(<FileExplorer data={mixed} aria-label="Files" />);
    const items = screen.getAllByRole("treeitem").map((el) => el.textContent?.replace(/\s+/g, "") ?? "");
    expect(items).toEqual(["afolder", "zfolder", "a.txt", "b.txt"]);
  });

  it("expands a folder to reveal its files on click", async () => {
    const user = userEvent.setup();
    render(<FileExplorer data={data} aria-label="Project files" />);

    expect(screen.queryByText("index.ts")).toBeNull();
    await user.click(screen.getByText("src"));
    await user.keyboard("{ArrowRight}");

    expect(await screen.findByText("index.ts")).toBeInTheDocument();
  });

  it("calls onFileSelect only for file nodes, not folders", async () => {
    const onFileSelect = vi.fn();
    const onSelectedIdChange = vi.fn();
    const user = userEvent.setup();
    render(
      <FileExplorer
        data={data}
        aria-label="Project files"
        onFileSelect={onFileSelect}
        onSelectedIdChange={onSelectedIdChange}
      />,
    );

    await user.click(screen.getByText("src"));
    expect(onFileSelect).not.toHaveBeenCalled();
    expect(onSelectedIdChange).toHaveBeenCalledWith("src");

    await user.click(screen.getByText("README.md"));
    expect(onFileSelect).toHaveBeenCalledWith(data[1]);
    expect(onSelectedIdChange).toHaveBeenCalledWith("readme");
  });

  it("has no axe violations", async () => {
    const { container } = render(<FileExplorer data={data} aria-label="Project files" defaultExpandedIds={["src"]} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
