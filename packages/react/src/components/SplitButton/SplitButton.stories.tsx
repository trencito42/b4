import type { Meta, StoryObj } from "@storybook/react-vite";
import { SplitButton } from "./SplitButton";

const meta: Meta<typeof SplitButton> = {
  title: "Family A — Actions & Identity/SplitButton",
  component: SplitButton,
  tags: ["autodocs"],
  args: {
    children: "Deploy",
    items: [
      { value: "deploy-preview", label: "Deploy preview" },
      { value: "deploy-staging", label: "Deploy to staging" },
      { value: "rollback", label: "Rollback", destructive: true },
    ],
    onSelect: (value: string) => console.log("selected", value),
  },
};

export default meta;
type Story = StoryObj<typeof SplitButton>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: "primary" } };
export const Disabled: Story = { args: { disabled: true } };
