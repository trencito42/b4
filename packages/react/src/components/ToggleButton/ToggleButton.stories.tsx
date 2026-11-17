import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleButton } from "./ToggleButton";

const meta: Meta<typeof ToggleButton> = {
  title: "Family A — Actions & Identity/ToggleButton",
  component: ToggleButton,
  tags: ["autodocs"],
  args: { children: "Mute" },
};

export default meta;
type Story = StoryObj<typeof ToggleButton>;

export const Unpressed: Story = {};
export const Pressed: Story = { args: { defaultPressed: true } };
export const Disabled: Story = { args: { disabled: true } };

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
      <ToggleButton size="sm">Small</ToggleButton>
      <ToggleButton size="md">Medium</ToggleButton>
      <ToggleButton size="lg">Large</ToggleButton>
    </div>
  ),
};
