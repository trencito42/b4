import type { Meta, StoryObj } from "@storybook/react-vite";
import { SplitButton } from "./SplitButton";

const meta: Meta<typeof SplitButton> = {
  title: "Family A — Actions & Identity/SplitButton",
  component: SplitButton,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["primary", "secondary", "ghost", "destructive"] },
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: {
    children: "Deploy",
    items: [
      { value: "deploy-preview", label: "Deploy preview" },
      { value: "deploy-staging", label: "Deploy to staging" },
      { value: "rollback", label: "Rollback", destructive: true },
    ],
    onSelect: (value: string) => console.log("selected", value),
  },
};

export default meta;
type Story = StoryObj<typeof SplitButton>;

export const Default: Story = {};
export const Primary: Story = { args: { variant: "primary" } };
export const Disabled: Story = { args: { disabled: true } };
/**
 * The "AllVariants" overview: every variant of this component, side by
 * side, so they can be compared without clicking through the controls.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
      {(["primary", "secondary", "ghost", "destructive"] as const).map((variant) => (
        <SplitButton
          key={variant}
          variant={variant}
          onSelect={() => {}}
          items={[
            { value: "duplicate", label: "Duplicate" },
            { value: "delete", label: "Delete", destructive: true },
          ]}
        >
          Save
        </SplitButton>
      ))}
    </div>
  ),
};

