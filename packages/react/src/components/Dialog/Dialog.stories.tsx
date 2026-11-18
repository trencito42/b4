import type { Meta, StoryObj } from "@storybook/react-vite";
import { Dialog } from "./Dialog";
import { Button } from "../Button/Button";

const meta: Meta<typeof Dialog> = {
  title: "Family C — Navigation & Overlays/Dialog",
  component: Dialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Dialog>;

export const Default: Story = {
  args: {
    trigger: <Button variant="secondary">Edit profile</Button>,
    title: "Edit profile",
    description: "Update your display name and avatar.",
    children: <p style={{ margin: 0 }}>Form fields would go here.</p>,
  },
};

export const WithoutDescription: Story = {
  args: {
    trigger: <Button variant="secondary">Open</Button>,
    title: "Quick note",
    children: <p style={{ margin: 0 }}>Just a title and content, no description.</p>,
  },
};
