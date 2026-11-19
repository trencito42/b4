import type { Meta, StoryObj } from "@storybook/react-vite";
import { SegmentedControl } from "./SegmentedControl";

const meta: Meta<typeof SegmentedControl> = {
  title: "Family A — Actions & Identity/SegmentedControl",
  component: SegmentedControl,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof SegmentedControl>;

/**
 * The mission's explicit quality reference: a graphite capsule that slides
 * behind the active label using a calibrated spring (`springs.travel`),
 * with correct keyboard interaction (arrow keys move focus and selection,
 * handled by Base UI's ToggleGroup), reduced-motion behavior (the indicator
 * jumps instead of sliding when `useReducedMotion()` is true), and no
 * stuck/glitched indicator under rapid repeated clicks — see
 * SegmentedControl.test.tsx for the rapid-click assertion.
 */
export const ChangelogLogin: Story = {
  args: {
    "aria-label": "Page",
    items: [
      { value: "changelog", label: "Changelog" },
      { value: "login", label: "Login" },
    ],
    defaultValue: "changelog",
  },
};

export const ThreeWay: Story = {
  args: {
    "aria-label": "View",
    items: [
      { value: "day", label: "Day" },
      { value: "week", label: "Week" },
      { value: "month", label: "Month" },
    ],
    defaultValue: "week",
  },
};

export const WithDisabledItem: Story = {
  args: {
    "aria-label": "Plan",
    items: [
      { value: "free", label: "Free" },
      { value: "pro", label: "Pro" },
      { value: "enterprise", label: "Enterprise", disabled: true },
    ],
    defaultValue: "free",
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <SegmentedControl
          key={size}
          aria-label="Page"
          size={size}
          items={[
            { value: "changelog", label: "Changelog" },
            { value: "login", label: "Login" },
          ]}
          defaultValue="changelog"
        />
      ))}
    </div>
  ),
};

export const PointerScrubbing: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      <p style={{ margin: 0, fontSize: "var(--b4-text-sm)", color: "var(--b4-text-secondary)" }}>
        Drag or scrub across segments horizontally with pointer/touch:
      </p>
      <SegmentedControl
        aria-label="Multi-tier selection"
        items={[
          { value: "us-east", label: "US East" },
          { value: "us-west", label: "US West" },
          { value: "eu-central", label: "EU Central" },
          { value: "ap-southeast", label: "AP Southeast" },
        ]}
        defaultValue="us-east"
        scrub
      />
    </div>
  ),
};

