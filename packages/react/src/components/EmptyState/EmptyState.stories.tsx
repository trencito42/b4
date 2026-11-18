import type { Meta, StoryObj } from "@storybook/react-vite";
import { EmptyState } from "./EmptyState";
import { Button } from "../Button/Button";

const meta: Meta<typeof EmptyState> = {
  title: "Family D — Data & Content/EmptyState",
  component: EmptyState,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof EmptyState>;

export const Default: Story = {
  args: {
    title: "No projects yet",
    description: "Create your first project to get started.",
  },
};

export const WithAction: Story = {
  args: {
    title: "No projects yet",
    description: "Create your first project to get started.",
    action: <Button>New project</Button>,
  },
};
