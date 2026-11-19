import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScrollArea } from "./ScrollArea";

const meta: Meta<typeof ScrollArea> = {
  title: "Family G — Layout Primitives/ScrollArea",
  component: ScrollArea,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ScrollArea>;

export const Default: Story = {
  render: () => (
    <div
      style={{
        width: 280,
        border: "1px solid var(--b4-border-subtle)",
        borderRadius: "var(--b4-radius-md)",
      }}
    >
      <ScrollArea maxHeight={200}>
        <div style={{ padding: 16 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ margin: "0 0 8px" }}>
              Row {i + 1}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div
      style={{
        width: 280,
        border: "1px solid var(--b4-border-subtle)",
        borderRadius: "var(--b4-radius-md)",
      }}
    >
      <ScrollArea maxHeight={200}>
        <div style={{ padding: 16 }}>
          {Array.from({ length: 20 }, (_, i) => (
            <p key={i} style={{ margin: "0 0 8px" }}>
              Row {i + 1}
            </p>
          ))}
        </div>
      </ScrollArea>
    </div>
  ),
};
