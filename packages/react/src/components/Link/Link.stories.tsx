import type { Meta, StoryObj } from "@storybook/react-vite";
import { Link } from "./Link";

const meta: Meta<typeof Link> = {
  title: "Family A — Actions & Identity/Link",
  component: Link,
  tags: ["autodocs"],
  argTypes: {
    tone: { control: "inline-radio", options: ["accent", "neutral"] },
  },
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


/**
 * The "AllTones" overview: every variant of this component, side by
 * side, so they can be compared without clicking through the controls.
 */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20 }}>
      {(["accent", "neutral"] as const).map((tone) => (
        <Link key={tone} href="#" tone={tone}>
          A {tone} link
        </Link>
      ))}
    </div>
  ),
};
/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = Accent;
