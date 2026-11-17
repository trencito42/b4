import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Family A — Actions & Identity/Link",
  component: Link,
  tags: ["autodocs"],
  args: { href: "#", children: "View documentation" },
};

export default meta;
type Story = StoryObj<typeof Link>;

export const Accent: Story = {};
export const Neutral: Story = { args: { tone: "neutral" } };
export const External: Story = { args: { external: true, children: "Base UI docs" } };

export const InBodyCopy: Story = {
  render: (args) => (
    <p style={{ maxWidth: 360, color: "var(--b4-text-primary)", fontFamily: "var(--b4-font-sans)" }}>
      Read the <Link {...args} tone="neutral" /> before changing token values —
      most contrast fixes belong at the token level, not the component.
    </p>
  ),
};
