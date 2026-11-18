import type { Meta, StoryObj } from "@storybook/react-vite";
import { NavigationMenu } from "./NavigationMenu";

const meta: Meta<typeof NavigationMenu> = {
  title: "Family C — Navigation & Overlays/NavigationMenu",
  component: NavigationMenu,
  tags: ["autodocs"],
  args: { "aria-label": "Main" },
};

export default meta;
type Story = StoryObj<typeof NavigationMenu>;

export const Default: Story = {
  args: {
    sections: [
      {
        label: "Products",
        items: [
          { label: "Overview", href: "/products", description: "What B4 ships" },
          { label: "Tokens", href: "/products/tokens", description: "Shared design values" },
          { label: "Motion", href: "/products/motion", description: "Spring presets and durations" },
        ],
      },
      {
        label: "Resources",
        items: [
          { label: "Documentation", href: "/docs" },
          { label: "Changelog", href: "/changelog" },
        ],
      },
    ],
  },
};
