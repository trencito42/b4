import type { Meta, StoryObj } from "@storybook/react-vite";
import { CircularProgress } from "./CircularProgress";

const meta: Meta<typeof CircularProgress> = {
  title: "Family D — Data & Content/CircularProgress",
  component: CircularProgress,
  tags: ["autodocs"],
  argTypes: {
    size: { control: { type: "number" } },
  },
};

export default meta;
type Story = StoryObj<typeof CircularProgress>;

export const Default: Story = {
  args: { label: "Uploading", value: 60, showValue: true },
};

export const Indeterminate: Story = {
  args: { label: "Processing", value: null },
};

export const Large: Story = {
  args: { label: "Sync progress", value: 75, size: 96, strokeWidth: 6, showValue: true },
};

export const HiddenLabel: Story = {
  args: { label: "Loading", hideLabel: true, value: 40 },
};
/**
 * The "AllSizes" overview: every variant of this component, side by
 * side, so they can be compared without clicking through the controls.
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24, alignItems: "flex-end" }}>
      {[24, 48, 72].map((size) => (
        <CircularProgress key={size} label={`${size}px`} value={60} size={size} />
      ))}
    </div>
  ),
};

