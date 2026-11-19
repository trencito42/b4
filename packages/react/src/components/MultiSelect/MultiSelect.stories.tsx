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
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
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


/**
 * The "AllSizes" overview: every variant of this component, side by
 * side, so they can be compared without clicking through the controls.
 */
export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <div key={size} style={{ width: 220 }}>
          <MultiSelect
            label="Team"
            size={size}
            items={[
              { value: "a", label: "Alpha" },
              { value: "b", label: "Beta" },
            ]}
          />
        </div>
      ))}
    </div>
  ),
};
/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = Empty;
