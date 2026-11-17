import type { Meta, StoryObj } from "@storybook/react-vite";
import { ButtonGroup } from "./ButtonGroup";
import { Button } from "../Button/Button";
import { IconButton } from "../IconButton/IconButton";

const BoldIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M7 5h7a4 4 0 0 1 0 8H7zM7 13h8a4 4 0 0 1 0 8H7z" strokeLinejoin="round" />
  </svg>
);
const ItalicIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
    <path d="M10 4h8M6 20h8M14 4 10 20" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof ButtonGroup> = {
  title: "Family A — Actions & Identity/ButtonGroup",
  component: ButtonGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ButtonGroup>;

export const Buttons: Story = {
  args: { "aria-label": "Zoom" },
  render: (args) => (
    <ButtonGroup {...args}>
      <Button variant="secondary">-</Button>
      <Button variant="secondary">100%</Button>
      <Button variant="secondary">+</Button>
    </ButtonGroup>
  ),
};

export const IconButtons: Story = {
  args: { "aria-label": "Text formatting" },
  render: (args) => (
    <ButtonGroup {...args}>
      <IconButton variant="secondary" icon={BoldIcon} aria-label="Bold" />
      <IconButton variant="secondary" icon={ItalicIcon} aria-label="Italic" />
    </ButtonGroup>
  ),
};
