import type { Meta, StoryObj } from "@storybook/react-vite";
import { Field } from "./Field";
import { Select } from "../Select/Select";

const meta: Meta<typeof Field> = {
  title: "Family B — Forms & Inputs/Field",
  component: Field,
  tags: ["autodocs"],
  decorators: [
    (Story) => (
      <div style={{ width: "min(20rem, calc(100vw - 6rem))" }}>
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        component:
          "Field provides the shared label, hint and error. B4 Select already composes Field: use Select for dropdowns instead of styling a native select or nesting another Field around it. For a custom native control, Base UI Field.Control supplies label association, not dropdown styling or motion.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof Field>;

const colors = [
  { value: "graphite", label: "Graphite", description: "Deep, neutral tones" },
  { value: "porcelain", label: "Porcelain", description: "Soft, light tones" },
];

/**
 * Keep the existing story ID for links. Select owns its Field wrapper, so
 * forward the label/hint/error to it rather than nesting duplicate Fields.
 * Do not use a native select as the visual reference for a B4 dropdown.
 */
export const WithCustomControl: Story = {
  args: {
    label: "Favorite color",
    hint: "Pick the one you'll use most.",
  },
  render: (args) => <Select {...args} items={colors} defaultValue="graphite" />,
};

export const WithError: Story = {
  args: { label: "Favorite color", error: "Pick one." },
  render: (args) => <Select {...args} items={colors} placeholder="Pick a color" />,
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = WithCustomControl;
