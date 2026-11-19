import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ColorPicker } from "./ColorPicker";

const meta: Meta<typeof ColorPicker> = {
  title: "Family B — Forms & Inputs/ColorPicker",
  component: ColorPicker,
  tags: ["autodocs"],
  args: { label: "Brand color" },
};

export default meta;
type Story = StoryObj<typeof ColorPicker>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState("#3366cc");
    return <ColorPicker {...args} value={value} onValueChange={setValue} />;
  },
};

export const WithHint: Story = {
  render: (args) => {
    const [value, setValue] = useState("#e5484d");
    return <ColorPicker {...args} value={value} onValueChange={setValue} hint="Used for destructive actions" />;
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = useState("#3366cc");
    return <ColorPicker {...args} value={value} onValueChange={setValue} error="Choose a darker shade" required />;
  },
};

export const Disabled: Story = {
  args: { disabled: true, value: "#808080" },
};
