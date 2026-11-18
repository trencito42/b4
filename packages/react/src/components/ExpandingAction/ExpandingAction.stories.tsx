import type { Meta, StoryObj } from "@storybook/react-vite";
import { ExpandingAction } from "./ExpandingAction";

const meta: Meta<typeof ExpandingAction> = {
  title: "Family E — Feedback & Motion/ExpandingAction",
  component: ExpandingAction,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ExpandingAction>;

const PlusIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M8 3v10M3 8h10" strokeLinecap="round" />
  </svg>
);

export const Default: Story = {
  args: {
    icon: PlusIcon,
    label: "New item",
  },
};

export const Disabled: Story = {
  args: {
    icon: PlusIcon,
    label: "New item",
    disabled: true,
  },
};
