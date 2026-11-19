import type { Meta, StoryObj } from "@storybook/react-vite";
import { StatusBadge } from "./StatusBadge";

const meta: Meta<typeof StatusBadge> = {
  title: "Family A — Actions & Identity/StatusBadge",
  component: StatusBadge,
  tags: ["autodocs"],
  argTypes: {
    status: { control: "inline-radio", options: ["online", "offline", "degraded", "idle"] },
  },
};

export default meta;
type Story = StoryObj<typeof StatusBadge>;

export const Online: Story = { args: { status: "online", children: "Connected" } };
export const Degraded: Story = { args: { status: "degraded", children: "Degraded performance" } };
export const Offline: Story = { args: { status: "offline", children: "Offline" } };
export const Idle: Story = { args: { status: "idle", children: "Idle" } };

/**
 * Do: always pair the dot with a status word. Don't: rely on the dot
 * color alone to communicate state — that's exactly what this component
 * exists to prevent (see Badge's doc comment on StatusBadge vs. Badge).
 */
export const AllStatuses: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <StatusBadge status="online">Connected</StatusBadge>
      <StatusBadge status="degraded">Degraded performance</StatusBadge>
      <StatusBadge status="offline">Offline</StatusBadge>
      <StatusBadge status="idle">Idle</StatusBadge>
    </div>
  ),
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = Online;
