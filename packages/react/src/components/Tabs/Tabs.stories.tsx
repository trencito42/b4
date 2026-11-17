import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tabs } from "./Tabs";

const meta: Meta<typeof Tabs> = {
  title: "Family C — Navigation & Overlays/Tabs",
  component: Tabs,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  args: {
    "aria-label": "Project settings",
    items: [
      { value: "general", label: "General", content: "General settings go here." },
      { value: "members", label: "Members", content: "Manage who has access." },
      { value: "billing", label: "Billing", content: "Plan and invoices." },
    ],
    defaultValue: "general",
  },
};

export const WithDisabledTab: Story = {
  args: {
    "aria-label": "Project settings",
    items: [
      { value: "general", label: "General", content: "General settings go here." },
      { value: "members", label: "Members", content: "Manage who has access." },
      { value: "billing", label: "Billing (upgrade required)", content: "", disabled: true },
    ],
    defaultValue: "general",
  },
};
