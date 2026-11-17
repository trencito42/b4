import type { Meta, StoryObj } from "@storybook/react-vite";
import { Switch } from "./Switch";

const meta: Meta<typeof Switch> = {
  title: "Family B — Forms & Inputs/Switch",
  component: Switch,
  tags: ["autodocs"],
  args: { label: "Enable notifications" },
  argTypes: {
    checked: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "min(24rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Switch>;

export const Off: Story = {};
export const On: Story = { args: { defaultChecked: true } };
export const Disabled: Story = { args: { disabled: true } };
export const DisabledOn: Story = { args: { disabled: true, defaultChecked: true } };

/** Use switches for immediate settings; use Checkbox for a submitted selection. */
export const AllStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--b4-space-4)" }}>
      <Switch label="Off" />
      <Switch label="On" defaultChecked />
      <Switch label="Disabled off" disabled />
      <Switch label="Disabled on" disabled defaultChecked />
    </div>
  ),
};

export const RightToLeft: Story = {
  render: () => (
    <div dir="rtl">
      <Switch label="Enable notifications" />
    </div>
  ),
};
