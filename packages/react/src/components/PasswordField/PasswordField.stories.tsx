import type { Meta, StoryObj } from "@storybook/react-vite";
import { PasswordField } from "./PasswordField";

const meta: Meta<typeof PasswordField> = {
  title: "Family B — Forms & Inputs/PasswordField",
  component: PasswordField,
  tags: ["autodocs"],
  args: { label: "Password", autoComplete: "current-password" },
};

export default meta;
type Story = StoryObj<typeof PasswordField>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "At least 12 characters." } };
export const WithError: Story = { args: { error: "Password is too short." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "secret123" } };
