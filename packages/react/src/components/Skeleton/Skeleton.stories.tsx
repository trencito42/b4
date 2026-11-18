import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Family D — Data & Content/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Skeleton>;

export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, width: 280 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <Skeleton variant="circle" />
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      <Skeleton variant="rect" />
    </div>
  ),
};

export const CardPlaceholder: Story = {
  render: () => (
    <div style={{ width: 280, display: "flex", flexDirection: "column", gap: 8 }}>
      <Skeleton variant="rect" height={140} />
      <Skeleton variant="text" width="80%" />
      <Skeleton variant="text" width="50%" />
    </div>
  ),
};
