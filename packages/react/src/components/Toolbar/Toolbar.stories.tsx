import type { Meta, StoryObj } from "@storybook/react-vite";
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarButton, ToolbarIconButton } from "./Toolbar";

const BoldIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <path d="M5 3h4a2.5 2.5 0 0 1 0 5H5zM5 8h4.5a2.5 2.5 0 0 1 0 5H5z" strokeLinejoin="round" />
  </svg>
);

const ItalicIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.75}>
    <path d="M9.5 3h-3M9.5 13h-3M9.5 3 6.5 13" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof Toolbar> = {
  title: "Family F — Application Patterns/Toolbar",
  component: Toolbar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Toolbar>;

export const Default: Story = {
  render: () => (
    <Toolbar aria-label="Text formatting">
      <ToolbarGroup>
        <ToolbarIconButton variant="ghost" aria-label="Bold" icon={BoldIcon} />
        <ToolbarIconButton variant="ghost" aria-label="Italic" icon={ItalicIcon} />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton variant="secondary">Insert link</ToolbarButton>
      <ToolbarButton>Publish</ToolbarButton>
    </Toolbar>
  ),
};
