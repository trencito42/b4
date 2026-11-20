import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToggleGroup } from "./ToggleGroup";

const BoldIcon = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M4.5 3h4a2.5 2.5 0 0 1 0 5h-4zM4.5 8h4.5a2.5 2.5 0 0 1 0 5H4.5z" strokeLinejoin="round" />
  </svg>
);
const ItalicIcon = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M10 3H6.5M9.5 13H6M9.5 3 6.5 13" strokeLinecap="round" />
  </svg>
);
const UnderlineIcon = (
  <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden="true">
    <path d="M4.5 3v4.5a3.5 3.5 0 0 0 7 0V3M4 13.5h8" strokeLinecap="round" />
  </svg>
);

const meta: Meta<typeof ToggleGroup> = {
  title: "Family A — Actions & Identity/ToggleGroup",
  component: ToggleGroup,
  tags: ["autodocs"],
  argTypes: {
    size: { control: "inline-radio", options: ["sm", "md", "lg"] },
    orientation: { control: "inline-radio", options: ["horizontal", "vertical"] },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    loop: { control: "boolean" },
  },
  parameters: {
    docs: {
      description: {
        component:
          "A group of related on/off buttons. Use ToggleGroup when zero pressed items is a legitimate state, or when several can be on at once (`multiple`) — toolbar formatting, filter toggles. Use SegmentedControl instead when exactly one option is always chosen and the control represents 'which view am I in'; it has its own travelling-capsule treatment for that.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof ToggleGroup>;

export const Default: Story = {
  args: {
    "aria-label": "Text alignment",
    items: [
      { value: "left", children: "Left" },
      { value: "center", children: "Center" },
      { value: "right", children: "Right" },
    ],
    defaultValue: ["left"],
  },
};

export const Multiple: Story = {
  name: "Multiple selection",
  args: {
    "aria-label": "Text formatting",
    multiple: true,
    items: [
      { value: "bold", children: BoldIcon, label: "Bold" },
      { value: "italic", children: ItalicIcon, label: "Italic" },
      { value: "underline", children: UnderlineIcon, label: "Underline" },
    ],
    defaultValue: ["bold", "underline"],
  },
};

export const IconWithText: Story = {
  name: "Icon with text",
  args: {
    "aria-label": "Text formatting",
    multiple: true,
    items: [
      { value: "bold", children: <>{BoldIcon} Bold</> },
      { value: "italic", children: <>{ItalicIcon} Italic</> },
    ],
    defaultValue: ["bold"],
  },
};

export const Vertical: Story = {
  args: {
    "aria-label": "Panel layout",
    orientation: "vertical",
    items: [
      { value: "list", children: "List" },
      { value: "grid", children: "Grid" },
      { value: "board", children: "Board" },
    ],
    defaultValue: ["grid"],
  },
};

export const WithDisabledItem: Story = {
  name: "With a disabled item",
  args: {
    "aria-label": "Export format",
    items: [
      { value: "csv", children: "CSV" },
      { value: "json", children: "JSON" },
      { value: "pdf", children: "PDF", disabled: true },
    ],
    defaultValue: ["csv"],
  },
};

export const Disabled: Story = {
  args: {
    "aria-label": "Text alignment",
    disabled: true,
    items: [
      { value: "left", children: "Left" },
      { value: "center", children: "Center" },
    ],
    defaultValue: ["left"],
  },
};

export const AllSizes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-7)", alignItems: "flex-start" }}>
      {(["sm", "md", "lg"] as const).map((size) => (
        <ToggleGroup
          key={size}
          aria-label={`Text alignment (${size})`}
          size={size}
          defaultValue={["center"]}
          items={[
            { value: "left", children: "Left" },
            { value: "center", children: "Center" },
            { value: "right", children: "Right" },
          ]}
        />
      ))}
    </div>
  ),
};

export const Controlled: Story = {
  render: () => {
    const [value, setValue] = useState<string[]>(["grid"]);
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-6)", alignItems: "flex-start" }}>
        <ToggleGroup
          aria-label="View mode"
          value={value}
          onValueChange={setValue}
          items={[
            { value: "list", children: "List" },
            { value: "grid", children: "Grid" },
            { value: "board", children: "Board" },
          ]}
        />
        <p style={{ color: "var(--b4-text-secondary)", fontSize: "var(--b4-text-sm)" }}>
          {/* Zero pressed items is a real state here — pressing the active
              item again clears it. That is the behavioural difference from
              SegmentedControl, where something is always selected. */}
          Pressed: {value.length ? value.join(", ") : "(none — a valid state)"}
        </p>
      </div>
    );
  },
};
