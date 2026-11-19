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

export const Swipeable: Story = {
  args: {
    "aria-label": "Mobile-optimized panels",
    swipeable: true,
    items: [
      {
        value: "metrics",
        label: "Metrics",
        content: (
          <div style={{ padding: "20px", background: "var(--b4-surface-2)", borderRadius: "var(--b4-surface-radius)" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Real-time Server Metrics</h4>
            <p style={{ margin: 0, color: "var(--b4-text-secondary)" }}>
              Swipe horizontally across this card to switch to Alerts.
            </p>
          </div>
        ),
      },
      {
        value: "alerts",
        label: "Alerts",
        content: (
          <div style={{ padding: "20px", background: "var(--b4-surface-2)", borderRadius: "var(--b4-surface-radius)" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>System Incidents & Alerts</h4>
            <p style={{ margin: 0, color: "var(--b4-text-secondary)" }}>
              Swipe left or right to navigate between panels.
            </p>
          </div>
        ),
      },
      {
        value: "logs",
        label: "Audit Logs",
        content: (
          <div style={{ padding: "20px", background: "var(--b4-surface-2)", borderRadius: "var(--b4-surface-radius)" }}>
            <h4 style={{ margin: "0 0 8px 0" }}>Security Audit Logs</h4>
            <p style={{ margin: 0, color: "var(--b4-text-secondary)" }}>
              End of list — rubber-bands when swiped right.
            </p>
          </div>
        ),
      },
    ],
    defaultValue: "metrics",
  },
};

