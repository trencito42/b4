import type { Meta, StoryObj } from "@storybook/react-vite";
import { ActivityFeed } from "./ActivityFeed";

const meta: Meta<typeof ActivityFeed> = {
  title: "Family D — Data & Content/ActivityFeed",
  component: ActivityFeed,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ActivityFeed>;

export const Default: Story = {
  args: {
    items: [
      { id: "1", actorName: "Ada Lovelace", action: "merged pull request #248", timestamp: "2 hours ago" },
      { id: "2", actorName: "Grace Hopper", action: "commented on issue #12", timestamp: "5 hours ago" },
      { id: "3", actorName: "Margaret Hamilton", action: "pushed 3 commits to main", timestamp: "1 day ago" },
    ],
  },
};
