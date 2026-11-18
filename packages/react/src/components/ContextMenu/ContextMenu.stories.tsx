import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContextMenu } from "./ContextMenu";

const meta: Meta<typeof ContextMenu> = {
  title: "Family C — Navigation & Overlays/ContextMenu",
  component: ContextMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ContextMenu>;

export const Default: Story = {
  args: {
    items: [
      { value: "rename", label: "Rename" },
      { value: "duplicate", label: "Duplicate" },
      { value: "archive", label: "Archive" },
      { value: "delete", label: "Delete", destructive: true },
    ],
    onSelect: (value) => console.log("selected", value),
  },
  render: (args) => (
    <ContextMenu {...args}>
      <div
        style={{
          width: 240,
          height: 140,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "var(--b4-surface-radius)",
          background: "var(--b4-surface-1)",
          color: "var(--b4-text-secondary)",
          fontFamily: "var(--b4-font-sans)",
        }}
      >
        Right-click (or long-press) here
      </div>
    </ContextMenu>
  ),
};
