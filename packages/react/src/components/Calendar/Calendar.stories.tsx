import type { Meta, StoryObj } from "@storybook/react-vite";
import { Calendar, type CalendarEvent } from "./Calendar";

const meta: Meta<typeof Calendar> = {
  title: "Family D — Data & Content/Calendar",
  component: Calendar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Calendar>;

const today = new Date();
const dayOf = (offset: number) => new Date(today.getFullYear(), today.getMonth(), today.getDate() + offset);

const events: CalendarEvent[] = [
  { id: "1", date: dayOf(0), label: "Standup", tone: "info" },
  { id: "2", date: dayOf(0), label: "Launch review", tone: "danger" },
  { id: "3", date: dayOf(2), label: "Design sync", tone: "neutral" },
  { id: "4", date: dayOf(2), label: "1:1 with Ada", tone: "neutral" },
  { id: "5", date: dayOf(2), label: "Release cut", tone: "success" },
  { id: "6", date: dayOf(2), label: "Postmortem", tone: "warning" },
  { id: "7", date: dayOf(5), label: "Quarterly planning", tone: "info" },
];

export const Default: Story = {
  args: {
    events,
    defaultMonth: today,
  },
};
