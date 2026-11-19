import type { Meta, StoryObj } from "@storybook/react-vite";
import { Separator } from "./Separator";

const meta: Meta<typeof Separator> = {
  title: "Family G — Layout Primitives/Separator",
  component: Separator,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
  },
};

export default meta;
type Story = StoryObj<typeof Separator>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <p style={{ margin: 0 }}>Section one</p>
      <div style={{ margin: "12px 0" }}>
        <Separator orientation="horizontal" />
      </div>
      <p style={{ margin: 0 }}>Section two</p>
    </div>
  ),
};

export const Horizontal: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <p style={{ margin: 0 }}>Section one</p>
      <div style={{ margin: "12px 0" }}>
        <Separator orientation="horizontal" />
      </div>
      <p style={{ margin: 0 }}>Section two</p>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", height: 40, gap: 12 }}>
      <span>Left</span>
      <Separator orientation="vertical" />
      <span>Right</span>
    </div>
  ),
};

export const AllOrientations: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ width: 280 }}>
        <p style={{ margin: 0 }}>Section one</p>
        <div style={{ margin: "12px 0" }}>
          <Separator orientation="horizontal" />
        </div>
        <p style={{ margin: 0 }}>Section two</p>
      </div>
      <div style={{ display: "flex", alignItems: "center", height: 40, gap: 12 }}>
        <span>Left</span>
        <Separator orientation="vertical" />
        <span>Right</span>
      </div>
    </div>
  ),
};
