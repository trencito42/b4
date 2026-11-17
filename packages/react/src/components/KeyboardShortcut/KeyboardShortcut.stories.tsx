import type { Meta, StoryObj } from "@storybook/react-vite";
import { KeyboardShortcut } from "./KeyboardShortcut";

const meta: Meta<typeof KeyboardShortcut> = {
  title: "Family A — Actions & Identity/KeyboardShortcut",
  component: KeyboardShortcut,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof KeyboardShortcut>;

export const Mac: Story = { args: { keys: ["⌘", "K"] } };
export const Windows: Story = { args: { keys: ["Ctrl", "K"] } };
export const ThreeKeys: Story = { args: { keys: ["Ctrl", "Shift", "P"] } };

export const InContext: Story = {
  render: () => (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        width: 220,
        padding: "8px 12px",
        borderRadius: "var(--b4-radius-md)",
        background: "var(--b4-control-bg)",
        color: "var(--b4-text-primary)",
        fontFamily: "var(--b4-font-sans)",
      }}
    >
      <span>Command Palette</span>
      <KeyboardShortcut keys={["⌘", "K"]} />
    </div>
  ),
};
