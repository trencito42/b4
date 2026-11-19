import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DatePicker } from "./DatePicker";

const meta: Meta<typeof DatePicker> = {
  title: "Family B — Forms & Inputs/DatePicker",
  component: DatePicker,
  tags: ["autodocs"],
  args: { label: "Appointment date" },
};

export default meta;
type Story = StoryObj<typeof DatePicker>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePicker {...args} value={value} onValueChange={setValue} />;
  },
};

export const WithDefaultValue: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(new Date(2026, 10, 18));
    return <DatePicker {...args} value={value} onValueChange={setValue} />;
  },
};

export const WithRange: Story = {
  name: "With min/max range",
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return (
      <DatePicker
        {...args}
        value={value}
        onValueChange={setValue}
        minDate={new Date(2026, 10, 10)}
        maxDate={new Date(2026, 10, 25)}
        hint="Available between Nov 10 and Nov 25"
      />
    );
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = useState<Date | null>(null);
    return <DatePicker {...args} value={value} onValueChange={setValue} error="A date is required" required />;
  },
};
