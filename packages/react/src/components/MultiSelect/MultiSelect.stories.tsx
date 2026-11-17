import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiSelect } from "./MultiSelect";

const items = [
  { value: "react", label: "React" },
  { value: "vue", label: "Vue" },
  { value: "svelte", label: "Svelte" },
  { value: "solid", label: "Solid", description: "Fine-grained reactivity" },
  { value: "angular", label: "Angular", disabled: true },
];

const meta: Meta<typeof MultiSelect> = {
  title: "Family B — Forms & Inputs/MultiSelect",
  component: MultiSelect,
  tags: ["autodocs"],
  args: { label: "Frameworks", items },
  decorators: [
    (Story) => (
      <div style={{ width: "min(20rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof MultiSelect>;

export const Empty: Story = {};
export const WithSelection: Story = { args: { defaultValue: ["react", "svelte"] } };
export const ManySelected: Story = {
  args: { defaultValue: ["react", "vue", "svelte", "solid"] },
};
export const WithHint: Story = { args: { hint: "Pick the ones your team uses." } };
export const WithError: Story = { args: { error: "Select at least one framework." } };
export const Disabled: Story = { args: { disabled: true, defaultValue: ["react"] } };
