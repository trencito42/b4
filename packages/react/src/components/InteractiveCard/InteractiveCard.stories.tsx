import type { Meta, StoryObj } from "@storybook/react-vite";
import { InteractiveCard } from "./InteractiveCard";

const meta: Meta<typeof InteractiveCard> = {
  title: "Family D — Data & Content/InteractiveCard",
  component: InteractiveCard,
  tags: ["autodocs"],
  argTypes: {
    padding: { control: "select", options: ["none", "sm", "md", "lg"] },
  },
};

export default meta;
type Story = StoryObj<typeof InteractiveCard>;

export const Default: Story = {
  args: {
    padding: "md",
    children: "Click me.",
  },
};

export const Disabled: Story = {
  args: {
    padding: "md",
    disabled: true,
    children: "Disabled.",
  },
};
