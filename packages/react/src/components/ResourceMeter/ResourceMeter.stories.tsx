import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResourceMeter } from "./ResourceMeter";

const meta: Meta<typeof ResourceMeter> = {
  title: "Family F — Application Patterns/ResourceMeter",
  component: ResourceMeter,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ResourceMeter>;

export const Default: Story = {
  args: {
    label: "Storage",
    value: 42,
    max: 100,
    unit: "GB",
  },
};

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 20, width: 280 }}>
      <ResourceMeter label="Storage" value={42} max={100} unit="GB" />
      <ResourceMeter label="Memory" value={80} max={100} unit="GB" />
      <ResourceMeter label="CPU" value={96} max={100} unit="%" />
    </div>
  ),
};
