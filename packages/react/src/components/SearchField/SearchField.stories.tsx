import type { Meta, StoryObj } from "@storybook/react-vite";
import { SearchField } from "./SearchField";

const meta: Meta<typeof SearchField> = {
  title: "Family B — Forms & Inputs/SearchField",
  component: SearchField,
  tags: ["autodocs"],
  args: { label: "Search", hideLabel: true, placeholder: "Search components..." },
};

export default meta;
type Story = StoryObj<typeof SearchField>;

export const Default: Story = {};
export const WithValue: Story = { args: { defaultValue: "button" } };
export const Disabled: Story = { args: { disabled: true } };
