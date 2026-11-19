import type { Meta, StoryObj } from "@storybook/react-vite";
import { Badge } from "./Badge";

const meta: Meta<typeof Badge> = {
  title: "Family A — Actions & Identity/Badge",
  component: Badge,
  tags: ["autodocs"],
  args: { children: "Beta" },
};

export default meta;
type Story = StoryObj<typeof Badge>;

export const Neutral: Story = {};
export const Accent: Story = { args: { tone: "accent", children: "New" } };
export const Success: Story = { args: { tone: "success", children: "Active" } };
export const Warning: Story = { args: { tone: "warning", children: "Degraded" } };
export const Danger: Story = { args: { tone: "danger", children: "Failed" } };
export const Info: Story = { args: { tone: "info", children: "Preview" } };

/**
 * Every tone's text color is tuned against its own tinted background,
 * not just "looks right" — see ARCHITECTURE.md / HANDOFF.md on why danger
 * needed a separate --b4-danger-text token from --b4-danger.
 */
export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
      <Badge tone="neutral">Neutral</Badge>
      <Badge tone="accent">Accent</Badge>
      <Badge tone="success">Success</Badge>
      <Badge tone="warning">Warning</Badge>
      <Badge tone="danger">Danger</Badge>
      <Badge tone="info">Info</Badge>
    </div>
  ),
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default = Neutral;
