import type { Meta, StoryObj } from "@storybook/react-vite";
import { Card } from "./Card";

const meta: Meta<typeof Card> = {
  title: "Family D — Data & Content/Card",
  component: Card,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "select", options: ["flat", "raised", "outlined"] },
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof Card>;

export const Default: Story = {
  args: {
    variant: "flat",
    padding: "md",
    children: "Card content.",
  },
};

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}>
      <Card variant="flat">Flat — a surface step above canvas, no shadow.</Card>
      <Card variant="raised">Raised — lifted with a soft shadow.</Card>
      <Card variant="outlined">Outlined — a bordered surface, no shadow.</Card>
    </div>
  ),
};
