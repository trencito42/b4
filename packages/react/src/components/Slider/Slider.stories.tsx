import type { Meta, StoryObj } from "@storybook/react-vite";
import { Slider } from "./Slider";
import { useState } from "react";

const meta: Meta<typeof Slider> = {
  title: "Family B — Forms & Inputs/Slider",
  component: Slider,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    variant: { control: "select", options: ["secondary", "primary"] },
    disabled: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(20rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
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
  args: {
    label: "Price range",
    defaultValue: [20, 80],
    thumbLabels: ["Minimum price", "Maximum price"],
    format: (v) => `$${v}`,
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--b4-space-9)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Slider key={size} label={`Volume (${size})`} size={size} defaultValue={40} />
      ))}
    </div>
  ),
};
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--b4-space-9)" }}>
      <Slider label="Neutral" defaultValue={40} />
      <Slider label="Emphasized" variant="primary" defaultValue={40} />
    </div>
  ),
};
export const Error: Story = {
  args: {
    label: "Budget",
    defaultValue: 90,
    error: "Choose a value below your available balance.",
  },
};
export const LongLabel: Story = {
  args: {
    label: "Maximum monthly budget for the entire workspace and all its projects",
    defaultValue: [10, 80],
    thumbLabels: ["Minimum budget", "Maximum budget"],
    hint: "The label wraps without moving the handles over the text.",
  },
};
// Keep the value in the owner when controlled; never update only the readout.
export const Controlled: Story = {
  render: function Controlled() {
    const [value, setValue] = useState<number | number[]>(40);
    return (
      <Slider
        label="Volume"
        value={value}
        onValueChange={setValue}
        format={(v) => `${v}%`}
      />
    );
  },
};
