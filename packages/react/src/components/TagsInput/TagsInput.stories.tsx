import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TagsInput } from "./TagsInput";

const meta: Meta<typeof TagsInput> = {
  title: "Family B — Forms & Inputs/TagsInput",
  component: TagsInput,
  tags: ["autodocs"],
  args: { label: "Topics", placeholder: "Add a topic…" },
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    addOnComma: { control: "boolean" },
    lowercase: { control: "boolean" },
    allowDuplicates: { control: "boolean" },
    maxTags: { control: { type: "number", min: 1, max: 12 } },
    maxLength: { control: { type: "number", min: 1, max: 40 } },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ inlineSize: "22rem", maxInlineSize: "100%" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TagsInput>;

export const Default: Story = {
  args: { defaultValue: ["design-system", "react"] },
};

export const Empty: Story = {
  args: { hint: "Press Enter or type a comma to add a topic." },
};

export const Controlled: Story = {
  render: function Render(args) {
    const [value, setValue] = useState<string[]>(["accessibility"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-5)" }}>
        <TagsInput {...args} value={value} onValueChange={setValue} />
        <p style={{ margin: 0, fontSize: "var(--b4-text-xs)", color: "var(--b4-text-tertiary)" }}>
          {value.length} tag{value.length === 1 ? "" : "s"}: {value.join(" · ") || "—"}
        </p>
      </div>
    );
  },
};

export const WithError: Story = {
  args: {
    defaultValue: ["ops"],
    error: "Add at least three topics before publishing.",
  },
};

export const LongTagsWrap: Story = {
  args: {
    defaultValue: [
      "infrastructure-observability",
      "incident-response-runbooks",
      "a-deliberately-very-long-tag-that-must-truncate-rather-than-overflow",
      "sre",
    ],
  },
};

export const Constrained: Story = {
  args: {
    defaultValue: ["alpha", "beta"],
    maxTags: 4,
    maxLength: 12,
    lowercase: true,
    hint: "Lowercased, 12 characters each, 4 maximum.",
  },
};

export const ReadOnly: Story = {
  args: { defaultValue: ["locked", "immutable"], readOnly: true },
};

export const Disabled: Story = {
  args: { defaultValue: ["disabled"], disabled: true },
};

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-7)" }}>
      <TagsInput {...args} size="sm" label="Small" defaultValue={["sm"]} />
      <TagsInput {...args} size="md" label="Medium" defaultValue={["md"]} />
      <TagsInput {...args} size="lg" label="Large" defaultValue={["lg"]} />
    </div>
  ),
};
