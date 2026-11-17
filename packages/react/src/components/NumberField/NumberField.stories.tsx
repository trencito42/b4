import type { Meta, StoryObj } from "@storybook/react-vite";
import { NumberField } from "./NumberField";

const meta: Meta<typeof NumberField> = {
  title: "Family B — Forms & Inputs/NumberField",
  component: NumberField,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "min(20rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
  args: { label: "Quantity", defaultValue: 1, min: 0, max: 99 },
};

export default meta;
type Story = StoryObj<typeof NumberField>;

export const Default: Story = {};
export const WithHint: Story = { args: { hint: "Up to 99 per order." } };
export const WithError: Story = { args: { error: "Enter a quantity." } };
export const WithStep: Story = { args: { label: "Price", step: 0.5, defaultValue: 9.5 } };
export const Disabled: Story = { args: { disabled: true } };
