import type { Meta, StoryObj } from "@storybook/react-vite";
import { Progress } from "./Progress";

const meta: Meta<typeof Progress> = {
  title: "Family D — Data & Content/Progress",
  component: Progress,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Progress>;

export const Default: Story = {
  args: { label: "Uploading", value: 60 },
};

export const Indeterminate: Story = {
  args: { label: "Processing", value: null },
};

export const Complete: Story = {
  args: { label: "Upload complete", value: 100 },
};

export const HiddenLabel: Story = {
  args: { label: "Loading progress", hideLabel: true, value: 45 },
};
