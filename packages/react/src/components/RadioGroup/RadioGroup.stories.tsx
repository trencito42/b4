import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Family B — Forms & Inputs/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof RadioGroup>;

export const Default: Story = {
  args: {
    "aria-label": "Billing plan",
    items: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise" },
    ],
    defaultValue: "pro",
  },
};

export const WithDisabledItem: Story = {
  args: {
    "aria-label": "Billing plan",
    items: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise (contact sales)", disabled: true },
    ],
    defaultValue: "free",
  },
};
