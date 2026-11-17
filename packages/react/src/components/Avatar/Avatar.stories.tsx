import type { Meta, StoryObj } from "@storybook/react-vite";
import { Avatar } from "./Avatar";

const meta: Meta<typeof Avatar> = {
  title: "Family A — Actions & Identity/Avatar",
  component: Avatar,
  tags: ["autodocs"],
  args: { name: "Ada Lovelace" },
};

export default meta;
type Story = StoryObj<typeof Avatar>;

export const InitialsFallback: Story = {};
export const SingleName: Story = { args: { name: "Madonna" } };
export const BrokenImage: Story = { args: { src: "https://broken.example/404.png" } };

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Avatar {...args} size="sm" />
      <Avatar {...args} size="md" />
      <Avatar {...args} size="lg" />
    </div>
  ),
};
