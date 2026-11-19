import type { Meta, StoryObj } from "@storybook/react-vite";
import { Skeleton } from "./Skeleton";

const meta: Meta<typeof Skeleton> = {
  title: "Family D — Data & Content/Skeleton",
  component: Skeleton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["text", "circle", "rect"] },
  },
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

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = AllVariants;
