import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sheet } from "./Sheet";
import { Button } from "../Button/Button";

const meta: Meta<typeof Sheet> = {
  title: "Family C — Navigation & Overlays/Sheet",
  component: Sheet,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sheet>;

export const Default: Story = {
  args: {
    title: "Filters",
    description: "Narrow down the results.",
    trigger: <Button>Open sheet</Button>,
    children: <p>Drag the panel toward the bottom edge to dismiss it, or press Escape.</p>,
  },
};

export const WithoutDescription: Story = {
  args: {
    title: "Share",
    trigger: <Button>Open share sheet</Button>,
    children: <p>Copy link, or share to another app.</p>,
  },
};
