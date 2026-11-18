import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { NotificationPanel, type NotificationItem } from "./NotificationPanel";
import { IconButton } from "../IconButton/IconButton";

const meta: Meta<typeof NotificationPanel> = {
  title: "Family E — Feedback & Motion/NotificationPanel",
  component: NotificationPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NotificationPanel>;

const BellIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M8 2a4 4 0 0 0-4 4v2.5L2.5 11h11L12 8.5V6a4 4 0 0 0-4-4Z" strokeLinejoin="round" />
    <path d="M6.5 13.5a1.5 1.5 0 0 0 3 0" strokeLinecap="round" />
  </svg>
);

const initialItems: NotificationItem[] = [
  { id: "1", title: "New comment on your draft", description: "Ada left a comment.", timestamp: "2m ago", read: false },
  { id: "2", title: "Deploy succeeded", description: "main branch is live.", timestamp: "1h ago", read: false },
  { id: "3", title: "Weekly summary ready", timestamp: "Yesterday", read: true },
];

export const Default: Story = {
  render: () => {
    const [items, setItems] = useState(initialItems);
    return (
      <NotificationPanel
        items={items}
        trigger={<IconButton icon={BellIcon} aria-label="Notifications" variant="ghost" />}
        onItemClick={(id) => setItems((prev) => prev.map((item) => (item.id === id ? { ...item, read: true } : item)))}
        onMarkAllRead={() => setItems((prev) => prev.map((item) => ({ ...item, read: true })))}
      />
    );
  },
};

export const Empty: Story = {
  render: () => (
    <NotificationPanel items={[]} trigger={<IconButton icon={BellIcon} aria-label="Notifications" variant="ghost" />} />
  ),
};

export const AllRead: Story = {
  render: () => (
    <NotificationPanel
      items={initialItems.map((item) => ({ ...item, read: true }))}
      trigger={<IconButton icon={BellIcon} aria-label="Notifications" variant="ghost" />}
    />
  ),
};
