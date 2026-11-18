import type { Meta, StoryObj } from "@storybook/react-vite";
import { Drawer } from "./Drawer";
import { Button } from "../Button/Button";

const meta: Meta<typeof Drawer> = {
  title: "Family C — Navigation & Overlays/Drawer",
  component: Drawer,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Drawer>;

export const Default: Story = {
  args: {
    title: "Edit profile",
    description: "Changes are saved automatically.",
    trigger: <Button>Open drawer</Button>,
    children: <p>Drag the panel toward the right edge to dismiss it, or press Escape.</p>,
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "Notifications",
    trigger: <Button>Open notifications</Button>,
    children: <p>No unread notifications.</p>,
  },
};
