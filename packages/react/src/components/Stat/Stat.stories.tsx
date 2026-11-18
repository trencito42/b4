import type { Meta, StoryObj } from "@storybook/react-vite";
import { Stat } from "./Stat";
import { Card } from "../Card/Card";

const meta: Meta<typeof Stat> = {
  title: "Family D — Data & Content/Stat",
  component: Stat,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Stat>;

export const Default: Story = {
  args: {
    label: "Monthly active users",
    value: "48,201",
    trend: { label: "+12%", direction: "up" },
    description: "vs. last 30 days",
  },
};

export const AllTrends: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 24 }}>
      <Card>
        <Stat label="Revenue" value="$82,400" trend={{ label: "+8%", direction: "up" }} />
      </Card>
      <Card>
        <Stat label="Churn" value="2.1%" trend={{ label: "-0.4%", direction: "down" }} />
      </Card>
      <Card>
        <Stat label="Uptime" value="99.98%" trend={{ label: "steady", direction: "neutral" }} />
      </Card>
    </div>
  ),
};
