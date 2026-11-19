import type { Meta, StoryObj } from "@storybook/react-vite";
import { Tooltip } from "./Tooltip";
import { IconButton } from "../IconButton/IconButton";
import { Button } from "../Button/Button";

const InfoIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 16v-5M12 8h.01" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof Tooltip> = {
  title: "Family C — Navigation & Overlays/Tooltip",
  component: Tooltip,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Tooltip>;

export const OnIconButton: Story = {
  args: { content: "Delete this project" },
  render: (args) => (
    <Tooltip {...args}>
      <IconButton variant="ghost" icon={InfoIcon} aria-label="Info" />
    </Tooltip>
  ),
};

export const OnButton: Story = {
  args: { content: "Requires an active subscription", side: "bottom" },
  render: (args) => (
    <Tooltip {...args}>
      <Button variant="secondary" disabled>
        Upgrade
      </Button>
    </Tooltip>
  ),
};

export const Sides: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 32, padding: 40 }}>
      {(["top", "right", "bottom", "left"] as const).map((side) => (
        <Tooltip key={side} content={`On the ${side}`} side={side}>
          <Button variant="secondary">{side}</Button>
        </Tooltip>
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
export const Default: Story = OnIconButton;
