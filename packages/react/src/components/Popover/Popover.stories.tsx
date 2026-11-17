import type { Meta, StoryObj } from "@storybook/react-vite";
import { Popover } from "./Popover";
import { Button } from "../Button/Button";

const meta: Meta<typeof Popover> = {
  title: "Family C — Navigation & Overlays/Popover",
  component: Popover,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Popover>;

export const Default: Story = {
  args: {
    title: "Deploy settings",
    trigger: <Button variant="secondary">Settings</Button>,
    children: "Configure how this project deploys on every push to main.",
  },
};

export const WithInteractiveContent: Story = {
  render: () => (
    <Popover
      title="Confirm"
      trigger={<Button variant="destructive">Delete</Button>}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <p style={{ margin: 0 }}>This action can't be undone.</p>
        <Button variant="destructive" size="sm">
          Delete permanently
        </Button>
      </div>
    </Popover>
  ),
};

export const WithoutTitle: Story = {
  args: {
    trigger: <Button variant="secondary">Info</Button>,
    children: "No title — just a short note.",
  },
};
