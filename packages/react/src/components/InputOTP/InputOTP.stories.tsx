import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InputOTP } from "./InputOTP";

const meta: Meta<typeof InputOTP> = {
  title: "Family B — Forms & Inputs/InputOTP",
  component: InputOTP,
  tags: ["autodocs"],
  args: { label: "Verification code" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    validationType: { control: "inline-radio", options: ["numeric", "alpha", "alphanumeric", "none"] },
    length: { control: { type: "number", min: 4, max: 10 } },
    mask: { control: "boolean" },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(26rem, calc(100vw - 4rem))" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Verification-code entry built on Base UI's OTPField. Paste fills every slot at once, `autocomplete=\"one-time-code\"` lets the OS/password manager autofill it, and `validationType=\"numeric\"` brings up a numeric keyboard on mobile — none of which survive a hand-rolled set of independent inputs, which is why this does not hand-roll them.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof InputOTP>;

export const Default: Story = {
  args: { hint: "Enter the 6-digit code we sent you." },
};

export const Grouped: Story = {
  name: "Grouped slots",
  args: { groupEvery: 3, hint: "Grouping is visual only — paste still fills all six." },
};

export const Alphanumeric: Story = {
  args: { validationType: "alphanumeric", hint: "Letters and digits accepted." },
};

export const Masked: Story = {
  args: { mask: true, hint: "Characters are obscured; the submitted value is unchanged." },
};

export const WithError: Story = {
  name: "With error",
  args: { defaultValue: "123456", error: "That code has expired. Request a new one." },
};

export const Disabled: Story = {
  args: { disabled: true, defaultValue: "123456" },
};

export const ReadOnly: Story = {
  name: "Read only",
  args: { readOnly: true, defaultValue: "482193" },
};

export const FourDigits: Story = {
  name: "Custom length",
  args: { length: 4, hint: "Length is configurable." },
};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-9)" }}>
      <InputOTP {...args} size="sm" label="Small" />
      <InputOTP {...args} size="md" label="Medium" />
      <InputOTP {...args} size="lg" label="Large" />
    </div>
  ),
};

export const Controlled: Story = {
  render: (args) => {
    const [value, setValue] = useState("");
    const [completed, setCompleted] = useState<string | null>(null);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-6)" }}>
        <InputOTP
          {...args}
          label="Verification code"
          value={value}
          onValueChange={setValue}
          onComplete={setCompleted}
        />
        <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)" }}>
          {completed ? `Complete — would submit now (${completed.length} chars).` : `${value.length}/6 entered.`}
        </p>
      </div>
    );
  },
};
