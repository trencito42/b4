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

export const RichMegaMenu: Story = {
  args: {
    sections: [
      {
        label: "Platform",
        columns: 2,
        items: [
          {
            label: "Design Tokens",
            href: "/platform/tokens",
            description: "Graphite and Porcelain multi-axis design tokens",
            badge: "Core",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="10" />
                <path d="M12 2a10 10 0 0 1 0 20v-20z" />
              </svg>
            ),
          },
          {
            label: "Motion Lab",
            href: "/platform/motion",
            description: "Physical spring presets and choreographies",
            badge: "New",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <path d="M4 12h16M12 4v16" />
              </svg>
            ),
          },
          {
            label: "Adaptive Foundations",
            href: "/platform/adaptive",
            description: "Touch scrubbing, gesture intent & swipe",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <rect x="5" y="2" width="14" height="20" rx="3" />
                <line x1="12" y1="18" x2="12.01" y2="18" strokeWidth={3} />
              </svg>
            ),
          },
          {
            label: "Accessibility Engine",
            href: "/platform/a11y",
            description: "Zero axe violations across all variant states",
            icon: (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                <circle cx="12" cy="12" r="9" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            ),
          },
        ],
        footer: {
          label: "Explore all architecture guides",
          href: "/platform/guides",
        },
      },
      {
        label: "Components",
        items: [
          {
            label: "SegmentedControl",
            href: "/components/segmented-control",
            description: "Capsule navigation with pointer scrubbing",
          },
          {
            label: "Tabs",
            href: "/components/tabs",
            description: "Direction-aware swipeable panels",
          },
          {
            label: "AppShell",
            href: "/components/app-shell",
            description: "Responsive layouts with off-canvas mobile drawer",
          },
        ],
        footer: {
          label: "View all 83 components",
          href: "/components",
        },
      },
      {
        label: "Resources",
        items: [
          { label: "Documentation", href: "/docs", description: "Integration guides & API references" },
          { label: "Changelog", href: "/changelog", description: "Latest releases and performance notes" },
        ],
      },
    ],
  },
};
