import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { CommandPalette } from "./CommandPalette";
import { Button } from "../Button/Button";

const meta: Meta<typeof CommandPalette> = {
  title: "Family C — Navigation & Overlays/CommandPalette",
  component: CommandPalette,
  tags: ["autodocs"],
  args: { "aria-label": "Command palette" },
};

export default meta;
type Story = StoryObj<typeof CommandPalette>;

const items = [
  { value: "new-file", label: "New file", shortcut: ["⌘", "N"] },
  { value: "open-file", label: "Open file…", shortcut: ["⌘", "O"] },
  { value: "save", label: "Save", description: "Save the current file", shortcut: ["⌘", "S"] },
  { value: "close-tab", label: "Close tab", shortcut: ["⌘", "W"] },
  { value: "toggle-theme", label: "Toggle theme", description: "Switch between Graphite and Porcelain" },
  { value: "search", label: "Search in project", shortcut: ["⌘", "⇧", "F"] },
];

export const Default: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false);
    const [lastSelected, setLastSelected] = useState<string | null>(null);
    return (
      <div>
        <Button onClick={() => setOpen(true)}>Open command palette (⌘K)</Button>
        {lastSelected && <p style={{ marginTop: 12 }}>Last selected: {lastSelected}</p>}
        <CommandPalette
          {...args}
          items={items}
          open={open}
          onOpenChange={setOpen}
          onSelect={setLastSelected}
        />
      </div>
    );
  },
};

export const InitiallyOpen: Story = {
  render: (args) => {
    const [open, setOpen] = useState(true);
    return <CommandPalette {...args} items={items} open={open} onOpenChange={setOpen} onSelect={() => {}} />;
  },
};
