import type { Meta, StoryObj } from "@storybook/react-vite";
import { TextField } from "./TextField";

const meta: Meta<typeof TextField> = {
  title: "Family B — Forms & Inputs/TextField",
  component: TextField,
  tags: ["autodocs"],
  args: { label: "Email address", placeholder: "you@example.com" },
};

export default meta;
type Story = StoryObj<typeof TextField>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "We'll never share your email." } };
export const WithError: Story = {
  args: { error: "Enter a valid email address.", defaultValue: "not-an-email" },
};
export const Required: Story = { args: { required: true } };
export const Disabled: Story = { args: { disabled: true, defaultValue: "disabled@example.com" } };

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-7)", width: "min(17.5rem, calc(100vw - 6rem))" }}>
      <TextField {...args} size="sm" label="Small" />
      <TextField {...args} size="md" label="Medium" />
      <TextField {...args} size="lg" label="Large" />
    </div>
  ),
};
