import type { Meta, StoryObj } from "@storybook/react-vite";
import { Timeline } from "./Timeline";

const meta: Meta<typeof Timeline> = {
  title: "Family D — Data & Content/Timeline",
  component: Timeline,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Timeline>;

export const Default: Story = {
  args: {
    items: [
      {
        id: "1",
        title: "Deployment succeeded",
        description: "v2.4.1 deployed to production.",
        timestamp: "2 hours ago",
        tone: "success",
      },
      {
        id: "2",
        title: "Build started",
        timestamp: "2 hours ago",
        tone: "info",
      },
      {
        id: "3",
        title: "Pull request merged",
        description: "#248 by stefan",
        timestamp: "5 hours ago",
      },
      {
        id: "4",
        title: "Tests failed on staging",
        description: "3 failing specs in checkout.spec.ts",
        timestamp: "1 day ago",
        tone: "danger",
      },
    ],
  },
};
