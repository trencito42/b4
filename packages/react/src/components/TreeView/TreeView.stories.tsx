import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TreeView, type TreeNode } from "./TreeView";

const meta: Meta<typeof TreeView> = {
  title: "Family C — Navigation & Overlays/TreeView",
  component: TreeView,
  tags: ["autodocs"],
  args: { "aria-label": "File explorer" },
};

export default meta;
type Story = StoryObj<typeof TreeView>;

const data: TreeNode[] = [
  {
    id: "src",
    label: "src",
    children: [
      {
        id: "components",
        label: "components",
        children: [
          { id: "button-tsx", label: "Button.tsx" },
          { id: "button-css", label: "Button.css" },
        ],
      },
      { id: "index-ts", label: "index.ts" },
    ],
  },
  {
    id: "docs",
    label: "docs",
    children: [{ id: "readme", label: "README.md" }],
  },
  { id: "package-json", label: "package.json" },
  { id: "locked", label: "node_modules (managed)", disabled: true },
];

export const Default: Story = {
  args: { data, defaultExpandedIds: ["src"] },
};

export const WithSelection: Story = {
  render: (args) => {
    const [selectedId, setSelectedId] = useState<string | null>("index-ts");
    return (
      <TreeView
        {...args}
        data={data}
        defaultExpandedIds={["src"]}
        selectedId={selectedId}
        onSelectedIdChange={setSelectedId}
      />
    );
  },
};

export const AllCollapsed: Story = {
  args: { data },
};
