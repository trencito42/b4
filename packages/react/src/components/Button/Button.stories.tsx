import type { Meta, StoryObj } from "@storybook/react-vite";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "Family A — Actions & Identity/Button",
  component: Button,
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "ghost", "destructive"],
    },
    size: { control: "select", options: ["sm", "md", "lg"] },
  },
  args: {
    children: "Deploy",
    variant: "primary",
    size: "md",
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {};

export const Secondary: Story = { args: { variant: "secondary" } };

export const Ghost: Story = { args: { variant: "ghost" } };

export const Destructive: Story = {
  args: { variant: "destructive", children: "Delete project" },
};

export const Loading: Story = { args: { loading: true } };

export const Disabled: Story = { args: { disabled: true } };

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <Button {...args} size="sm">
        Small
      </Button>
      <Button {...args} size="md">
        Medium
      </Button>
      <Button {...args} size="lg">
        Large
      </Button>
    </div>
  ),
};

/**
 * Do: use `destructive` only for actions that cannot be undone trivially.
 * Don't: rely on color alone — destructive actions in real flows should be
 * paired with an AlertDialog confirmation (see Family C).
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12 }}>
      <Button variant="primary">Primary</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const AsyncStates: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <Button status="idle">Idle: Deploy app</Button>
      <Button status="pending" statusLabels={{ pending: "Deploying…" }}>
        Deploy app
      </Button>
      <Button status="success" statusLabels={{ success: "Deployed" }}>
        Deploy app
      </Button>
      <Button status="error" statusLabels={{ error: "Retry deployment" }}>
        Deploy app
      </Button>
    </div>
  ),
};

export const InteractiveAsyncAction: Story = {
  render: () => (
    <Button
      variant="primary"
      onAction={async () => {
        await new Promise((resolve) => setTimeout(resolve, 1500));
      }}
      statusLabels={{
        idle: "Deploy to production",
        pending: "Deploying cluster…",
        success: "Cluster deployed!",
        error: "Deployment failed",
      }}
    >
      Deploy to production
    </Button>
  ),
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = Primary;
