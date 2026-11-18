import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TimePicker, type TimeValue } from "./TimePicker";

const meta: Meta<typeof TimePicker> = {
  title: "Family B — Inputs & Forms/TimePicker",
  component: TimePicker,
  tags: ["autodocs"],
  args: { label: "Reminder time" },
};

export default meta;
type Story = StoryObj<typeof TimePicker>;

export const Default: Story = {
  render: (args) => {
    const [value, setValue] = useState<TimeValue>({ hours: 14, minutes: 30 });
    return <TimePicker {...args} value={value} onValueChange={setValue} />;
  },
};

export const TwentyFourHour: Story = {
  name: "24-hour",
  render: (args) => {
    const [value, setValue] = useState<TimeValue>({ hours: 14, minutes: 30 });
    return <TimePicker {...args} use24Hour value={value} onValueChange={setValue} />;
  },
};

export const WithError: Story = {
  render: (args) => {
    const [value, setValue] = useState<TimeValue>({ hours: 9, minutes: 0 });
    return <TimePicker {...args} value={value} onValueChange={setValue} error="Pick a time after 9 AM" required />;
  },
};

export const Disabled: Story = {
  args: { disabled: true },
  render: (args) => {
    const [value] = useState<TimeValue>({ hours: 8, minutes: 15 });
    return <TimePicker {...args} value={value} onValueChange={() => {}} />;
  },
};
