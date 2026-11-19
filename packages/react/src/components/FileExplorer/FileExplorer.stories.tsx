import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileExplorer, type FileExplorerNode } from "./FileExplorer";

const data: FileExplorerNode[] = [
  {
    id: "src",
    name: "src",
    type: "folder",
    children: [
      {
        id: "components",
        name: "components",
        type: "folder",
        children: [
          { id: "button-tsx", name: "Button.tsx", type: "file" },
          { id: "button-css", name: "Button.css", type: "file" },
        ],
      },
      { id: "index-ts", name: "index.ts", type: "file" },
    ],
  },
  { id: "readme", name: "README.md", type: "file" },
  { id: "package-json", name: "package.json", type: "file" },
];

const meta: Meta<typeof FileExplorer> = {
  title: "Family F — Application Patterns/FileExplorer",
  component: FileExplorer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof FileExplorer>;

export const Default: Story = {
  args: {
    data,
    "aria-label": "Project files",
    defaultExpandedIds: ["src"],
  },
};
