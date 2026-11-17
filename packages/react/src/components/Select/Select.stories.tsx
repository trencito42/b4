import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Select, type SelectItem } from "./Select";
import { Button } from "../Button/Button.js";

const items: SelectItem[] = [
  { value: "draft", label: "Draft", description: "Only visible to you" },
  {
    value: "review",
    label: "In review",
    description: "Waiting for approval",
    disabled: true,
  },
  { value: "published", label: "Published", description: "Visible to everyone" },
  { value: "archived", label: "Archived", description: "Saved for later" },
];
const meta: Meta<typeof Select> = {
  title: "Family B - Forms & Inputs/Select",
  component: Select,
  tags: ["autodocs"],
  args: { label: "Publication status", items },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
    hideLabel: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div
        style={{
          width: "min(20rem, calc(100vw - 6rem))",
          minWidth: "var(--b4-space-16)",
        }}
      >
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Select>;
export const Default: Story = {};
export const WithHint: Story = {
  args: { hint: "You can change this later.", defaultValue: "draft" },
};
export const Error: Story = {
  args: { error: "Choose a publication status.", required: true },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "draft" } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "published" } };
export const Empty: Story = { args: { items: [] } };
export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--b4-space-8)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Select {...args} key={size} size={size} label={`Status (${size})`} />
      ))}
    </div>
  ),
};
export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState<string | null>("draft");
    return (
      <div style={{ display: "grid", gap: "var(--b4-space-7)" }}>
        <Select {...args} value={value} onValueChange={setValue} />
        <Button variant="secondary" onClick={() => setValue(null)}>
          Clear selection
        </Button>
      </div>
    );
  },
};
// Do: use a Combobox (when available) for large searchable catalogs.
// Don't: force a long collection into a fixed-height page or truncate option labels.
export const LongCollection: Story = {
  args: {
    items: Array.from({ length: 40 }, (_, index) => ({
      value: `workspace-${index}`,
      label: `Workspace ${index + 1}`,
      description:
        "A long description that wraps to fit narrow screens without clipping.",
    })),
  },
};
export const NearViewportEdge: Story = {
  parameters: { layout: "fullscreen" },
  render: (args) => (
    <div
      style={{
        position: "fixed",
        insetInlineEnd: "var(--b4-space-7)",
        insetBlockEnd: "var(--b4-space-7)",
        width: "min(70vw, var(--b4-popup-max-height))",
      }}
    >
      <Select
        {...args}
        items={Array.from({ length: 40 }, (_, index) => ({
          value: `item-${index}`,
          label: `Collection item ${index + 1}`,
        }))}
      />
    </div>
  ),
};
