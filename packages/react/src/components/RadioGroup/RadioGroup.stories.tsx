import type { Meta, StoryObj } from "@storybook/react-vite";
import { RadioGroup } from "./RadioGroup";

const meta: Meta<typeof RadioGroup> = {
  title: "Family B — Forms & Inputs/RadioGroup",
  component: RadioGroup,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "min(20rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
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

export const WithDescriptions: Story = {
  args: {
    "aria-label": "Billing plan",
    defaultValue: "pro",
    items: [
      {
        value: "free",
        label: "Personal",
        description: "A quiet space for your own projects.",
      },
      {
        value: "pro",
        label: "Team",
        description: "Shared projects, collaboration and history.",
      },
      {
        value: "enterprise",
        label: "Organization",
        description: "More control for larger teams.",
      },
    ],
  },
};
