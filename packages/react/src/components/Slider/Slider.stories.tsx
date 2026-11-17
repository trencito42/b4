import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./Slider";

const meta: Meta<typeof Slider> = {
  title: "Family B — Forms & Inputs/Slider",
  component: Slider,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Slider>;

export const Default: Story = {
  args: { label: "Volume", defaultValue: 40 },
};

export const WithHint: Story = {
  args: { label: "Volume", defaultValue: 40, hint: "Affects all notification sounds." },
};

export const Percentage: Story = {
  args: { label: "Opacity", defaultValue: 75, format: (v) => `${v}%` },
};

export const Disabled: Story = {
  args: { label: "Volume", defaultValue: 40, disabled: true },
};

/**
 * Passing an array value makes this a range slider — covers the mission
 * brief's "RangeSlider" entry with the same component.
 */
export const Range: Story = {
  args: { label: "Price range", defaultValue: [20, 80], format: (v) => `$${v}` },
};
