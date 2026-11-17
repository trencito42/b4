import type { Meta, StoryObj } from "@storybook/react-vite";
import { Textarea } from "./Textarea";

const meta: Meta<typeof Textarea> = {
  title: "Family B — Forms & Inputs/Textarea",
  component: Textarea,
  tags: ["autodocs"],
  args: { label: "Description", placeholder: "Describe the issue..." },
};

export default meta;
type Story = StoryObj<typeof Textarea>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "Markdown is supported." } };
export const WithError: Story = { args: { error: "Description is required." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "Can't edit this." } };
