import type { Meta, StoryObj } from "@storybook/react-vite";
import { Breadcrumbs } from "./Breadcrumbs";

const meta: Meta<typeof Breadcrumbs> = {
  title: "Family C — Navigation & Overlays/Breadcrumbs",
  component: Breadcrumbs,
  tags: ["autodocs"],
  args: { "aria-label": "Breadcrumb" },
};

export default meta;
type Story = StoryObj<typeof Breadcrumbs>;

export const Default: Story = {
  args: {
    items: [
      { label: "Projects", href: "/projects" },
      { label: "B4", href: "/projects/b4" },
      { label: "Components" },
    ],
  },
};

export const TwoLevels: Story = {
  args: {
    items: [{ label: "Home", href: "/" }, { label: "Settings" }],
  },
};

export const NonNavigableAncestor: Story = {
  args: {
    items: [
      { label: "…" },
      { label: "B4", href: "/projects/b4" },
      { label: "Button" },
    ],
  },
};
