import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { Combobox } from "./Combobox";
import type { SelectItem } from "../Select/Select.js";
import { Button } from "../Button/Button.js";

const items: SelectItem[] = [
  { value: "de", label: "Germany", description: "Frankfurt" },
  { value: "nl", label: "Netherlands", description: "Amsterdam", disabled: true },
  { value: "ro", label: "Romania", description: "Bucharest" },
  { value: "us", label: "United States", description: "New York" },
];
const meta: Meta<typeof Combobox> = {
  title: "Family B - Forms & Inputs/Combobox",
  component: Combobox,
  tags: ["autodocs"],
  args: { label: "Region", items },
  argTypes: {
    size: { control: "select", options: ["sm", "md", "lg"] },
    disabled: { control: "boolean" },
    readOnly: { control: "boolean" },
    loading: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ width: "min(20rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
};
export default meta;
type Story = StoryObj<typeof Combobox>;
export const Default: Story = {};
export const WithHint: Story = {
  args: { hint: "Search by country name.", defaultValue: "ro" },
};
export const Disabled: Story = { args: { disabled: true, defaultValue: "ro" } };
export const ReadOnly: Story = { args: { readOnly: true, defaultValue: "ro" } };
export const Error: Story = {
  args: { error: "Choose an available region.", required: true },
};
export const Empty: Story = { args: { items: [] } };
export const Loading: Story = { args: { loading: true } };
export const LongCollection: Story = {
  args: {
    items: Array.from({ length: 40 }, (_, index) => ({
      value: `region-${index}`,
      label: `Region ${index + 1}`,
      description: "Searchable location",
    })),
  },
};
export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: "var(--b4-space-8)" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <Combobox {...args} key={size} size={size} label={`Region (${size})`} />
      ))}
    </div>
  ),
};
export const Controlled: Story = {
  render: function Controlled(args) {
    const [value, setValue] = useState<string | null>("ro");
    return (
      <div style={{ display: "grid", gap: "var(--b4-space-7)" }}>
        <Combobox {...args} value={value} onValueChange={setValue} />
        <Button variant="secondary" onClick={() => setValue(null)}>
          Reset region
        </Button>
      </div>
    );
  },
};
// A data request belongs to the caller. Do not simulate async success with a
// hardcoded timeout; loading, failure and request cancellation need real state.
export const ReplacedCollection: Story = {
  render: function ReplacedCollection(args) {
    const [extended, setExtended] = useState(false);
    return (
      <div style={{ display: "grid", gap: "var(--b4-space-7)" }}>
        <Combobox
          {...args}
          defaultValue="ro"
          items={
            extended
              ? [...items, { value: "jp", label: "Japan", description: "Tokyo" }]
              : items
          }
        />
        <Button variant="secondary" onClick={() => setExtended((value) => !value)}>
          Update available regions
        </Button>
      </div>
    );
  },
};
