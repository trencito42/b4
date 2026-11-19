import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "@base-ui/react/input";
import { InputGroup } from "./InputGroup";

const meta: Meta<typeof InputGroup> = {
  title: "Family B — Forms & Inputs/InputGroup",
  component: InputGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InputGroup>;

export const WithPrefix: Story = {
  args: { label: "Website", startAddon: "https://" },
  render: (args) => (
    <InputGroup {...args}>
      <Input className="b4-text-field__input" placeholder="example.com" />
    </InputGroup>
  ),
};

export const WithSuffix: Story = {
  args: { label: "Domain", endAddon: ".com" },
  render: (args) => (
    <InputGroup {...args}>
      <Input className="b4-text-field__input" placeholder="example" />
    </InputGroup>
  ),
};

export const WithError: Story = {
  args: { label: "Website", startAddon: "https://", error: "Enter a valid domain." },
  render: (args) => (
    <InputGroup {...args}>
      <Input className="b4-text-field__input" placeholder="example.com" />
    </InputGroup>
  ),
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = WithPrefix;
