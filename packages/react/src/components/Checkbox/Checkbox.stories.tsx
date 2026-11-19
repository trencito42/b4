import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { Checkbox } from "./Checkbox";

const meta: Meta<typeof Checkbox> = {
  title: "Family B — Forms & Inputs/Checkbox",
  component: Checkbox,
  tags: ["autodocs"],
  args: { label: "Accept terms and conditions" },
  argTypes: {
    checked: { control: "boolean" },
    indeterminate: { control: "boolean" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
  },
  decorators: [
    (Story) => (
      <div style={{ maxWidth: "min(24rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Checkbox>;

export const Unchecked: Story = {};
export const Checked: Story = { args: { defaultChecked: true } };
export const Indeterminate: Story = {
  args: { indeterminate: true, label: "Select all" },
};
export const Disabled: Story = { args: { disabled: true } };
export const DisabledChecked: Story = { args: { disabled: true, defaultChecked: true } };

export const AllStates: Story = {
  render: () => (
    <div style={{ display: "grid", gap: "var(--b4-space-4)" }}>
      <Checkbox label="Unchecked" />
      <Checkbox label="Checked" defaultChecked />
      <Checkbox label="Partially selected" indeterminate />
      <Checkbox label="Disabled" disabled />
      <Checkbox label="Disabled checked" disabled defaultChecked />
    </div>
  ),
};

function SelectionExample() {
  const choices = ["Product updates", "Release notes", "Research invitations"];
  const [selected, setSelected] = useState([choices[0]]);
  return (
    <div style={{ display: "grid", gap: "var(--b4-space-4)" }}>
      <Checkbox
        label="Select all subscriptions"
        checked={selected.length === choices.length}
        indeterminate={selected.length > 0 && selected.length < choices.length}
        onCheckedChange={(next) => setSelected(next ? choices : [])}
      />
      <div style={{ display: "grid", paddingInlineStart: "var(--b4-space-8)" }}>
        {choices.map((choice) => (
          <Checkbox
            key={choice}
            label={choice}
            checked={selected.includes(choice)}
            onCheckedChange={(next) =>
              setSelected((current) =>
                next ? [...current, choice] : current.filter((item) => item !== choice),
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

/** Mixed is derived from the selection; do not leave indeterminate permanently true. */
export const Selection: Story = { render: () => <SelectionExample /> };

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default = Unchecked;
