import type { Meta, StoryObj } from "@storybook/react-vite";
import { AspectRatio } from "./AspectRatio";

const meta: Meta<typeof AspectRatio> = {
  title: "Family G — Layout Primitives/AspectRatio",
  component: AspectRatio,
  tags: ["autodocs"],
  argTypes: {
    ratio: { control: { type: "number", min: 0.5, max: 3, step: 0.05 } },
  },
};

export default meta;
type Story = StoryObj<typeof AspectRatio>;

function Placeholder() {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "var(--b4-surface-raised)",
        border: "1px solid var(--b4-border-subtle)",
        borderRadius: "var(--b4-radius-md)",
        color: "var(--b4-text-secondary)",
        fontSize: "var(--b4-text-sm)",
      }}
    >
      16 : 9
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <Placeholder />
      </AspectRatio>
    </div>
  ),
};

export const Widescreen: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <AspectRatio ratio={16 / 9}>
        <Placeholder />
      </AspectRatio>
    </div>
  ),
};

export const Square: Story = {
  render: () => (
    <div style={{ width: 200 }}>
      <AspectRatio ratio={1}>
        <Placeholder />
      </AspectRatio>
    </div>
  ),
};
