import type { Meta, StoryObj } from "@storybook/react-vite";
import { Collapsible } from "./Collapsible";

const meta: Meta<typeof Collapsible> = {
  title: "Family G — Layout Primitives/Collapsible",
  component: Collapsible,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Collapsible>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Collapsible trigger="Advanced options" defaultOpen>
        <p style={{ margin: 0 }}>
          These settings are rarely changed, but shown here to demonstrate the panel's smooth height
          animation.
        </p>
      </Collapsible>
    </div>
  ),
};

export const Disabled: Story = {
  render: () => (
    <div style={{ width: 320 }}>
      <Collapsible trigger="Advanced options" disabled>
        <p style={{ margin: 0 }}>Not reachable while disabled.</p>
      </Collapsible>
    </div>
  ),
};
