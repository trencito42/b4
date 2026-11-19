import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarGroup } from "./AvatarGroup";

const people = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Margaret Hamilton" },
  { name: "Katherine Johnson" },
  { name: "Radia Perlman" },
  { name: "Barbara Liskov" },
];

const meta: Meta<typeof AvatarGroup> = {
  title: "Family A — Actions & Identity/AvatarGroup",
  component: AvatarGroup,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
  },
  args: { people },
};

export default meta;
type Story = StoryObj<typeof AvatarGroup>;

export const Default: Story = {};
export const NoOverflow: Story = { args: { people: people.slice(0, 2) } };
export const MaxTwo: Story = { args: { max: 2 } };

export const AllSizes: Story = {
  render: (args) => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <AvatarGroup {...args} size="sm" />
      <AvatarGroup {...args} size="md" />
      <AvatarGroup {...args} size="lg" />
    </div>
  ),
};
