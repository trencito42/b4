import type { Meta, StoryObj } from "@storybook/react-vite";
import { VisuallyHidden } from "./VisuallyHidden";

const meta: Meta<typeof VisuallyHidden> = {
  title: "Family G — Layout Primitives/VisuallyHidden",
  component: VisuallyHidden,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Content is in the DOM and read by screen readers, but clipped from view — inspect with a screen reader or the accessibility tree, not by looking at the canvas.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof VisuallyHidden>;

export const Default: Story = {
  render: () => (
    <button type="button" style={{ border: "1px solid var(--b4-border-default)", borderRadius: 8, padding: 8 }}>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M3 8h10M8 3v10" strokeLinecap="round" />
      </svg>
      <VisuallyHidden>Add item</VisuallyHidden>
    </button>
  ),
};

export const IconButtonLabel: Story = {
  render: () => (
    <button type="button" style={{ border: "1px solid var(--b4-border-default)", borderRadius: 8, padding: 8 }}>
      <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
        <path d="M3 8h10M8 3v10" strokeLinecap="round" />
      </svg>
      <VisuallyHidden>Add item</VisuallyHidden>
    </button>
  ),
};
