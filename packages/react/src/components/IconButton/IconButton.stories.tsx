import type { Meta, StoryObj } from "@storybook/react-vite";
import { IconButton } from "./IconButton";

const PlusIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M12 5v14M5 12h14" strokeLinecap="round" />
  </svg>
);

const TrashIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path
      d="M4 7h16M9 7V4h6v3m-8 0 1 13h10l1-13"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const meta: Meta<typeof IconButton> = {
  title: "Family A — Actions & Identity/IconButton",
  component: IconButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: { icon: PlusIcon, "aria-label": "Add item", variant: "primary", size: "md" },
};

export default meta;
type Story = StoryObj<typeof IconButton>;

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Ghost: Story = { args: { variant: "ghost" } };
export const Destructive: Story = {
  args: { variant: "destructive", icon: TrashIcon, "aria-label": "Delete item" },
};
export const Loading: Story = { args: { loading: true } };
export const Disabled: Story = { args: { disabled: true } };

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <IconButton {...args} size="sm" />
      <IconButton {...args} size="md" />
      <IconButton {...args} size="lg" />
    </div>
  ),
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = Primary;
