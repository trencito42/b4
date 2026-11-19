import type { Meta, StoryObj } from "@storybook/react-vite";
import { Sidebar, type SidebarSection } from "./Sidebar";

const HomeIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <path d="M2 7.5 8 2.5l6 5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1Z" strokeLinejoin="round" />
  </svg>
);

const SettingsIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
    <circle cx="8" cy="8" r="2.5" />
    <path d="M8 1.5v2M8 12.5v2M14.5 8h-2M3.5 8h-2M12.3 3.7l-1.4 1.4M5.1 10.9l-1.4 1.4M12.3 12.3l-1.4-1.4M5.1 5.1 3.7 3.7" strokeLinecap="round" />
  </svg>
);

const sections: SidebarSection[] = [
  {
    id: "main",
    items: [
      { id: "home", label: "Home", icon: HomeIcon, href: "#home" },
      { id: "projects", label: "Projects", href: "#projects" },
    ],
  },
  {
    id: "account",
    label: "Account",
    items: [{ id: "settings", label: "Settings", icon: SettingsIcon, href: "#settings" }],
  },
];

const meta: Meta<typeof Sidebar> = {
  title: "Family F — Application Patterns/Sidebar",
  component: Sidebar,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof Sidebar>;

export const Default: Story = {
  args: {
    sections,
    activeItemId: "home",
  },
};
