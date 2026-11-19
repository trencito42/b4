import type { Meta, StoryObj } from "@storybook/react-vite";
import { InspectorPanel, type InspectorSection } from "./InspectorPanel";

const sections: InspectorSection[] = [
  {
    id: "general",
    title: "General",
    properties: [
      { id: "name", label: "Name", value: "Marketing site" },
      { id: "type", label: "Type", value: "Web app" },
      { id: "owner", label: "Owner", value: "Ada Lovelace" },
    ],
  },
  {
    id: "deployment",
    title: "Deployment",
    properties: [
      { id: "status", label: "Status", value: "Live" },
      { id: "updated", label: "Last updated", value: "2026-11-18" },
    ],
  },
];

const meta: Meta<typeof InspectorPanel> = {
  title: "Family F — Application Patterns/InspectorPanel",
  component: InspectorPanel,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InspectorPanel>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <InspectorPanel title="Marketing site" sections={sections} onClose={() => {}} />
    </div>
  ),
};
