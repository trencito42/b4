import type { Meta, StoryObj } from "@storybook/react-vite";
import { DropdownMenu } from "./DropdownMenu";
import { Button } from "../Button/Button";

const meta: Meta<typeof DropdownMenu> = {
  title: "Family C — Navigation & Overlays/DropdownMenu",
  component: DropdownMenu,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DropdownMenu>;

export const Default: Story = {
  args: {
    trigger: <Button variant="secondary">Actions</Button>,
    items: [
      { value: "rename", label: "Rename" },
      { value: "duplicate", label: "Duplicate" },
      { value: "archive", label: "Archive" },
      { value: "delete", label: "Delete", destructive: true },
    ],
    onSelect: (value) => console.log("selected", value),
  },
};

export const WithDisabledItem: Story = {
  args: {
    trigger: <Button variant="secondary">Actions</Button>,
    items: [
      { value: "rename", label: "Rename" },
      { value: "duplicate", label: "Duplicate", disabled: true },
      { value: "delete", label: "Delete", destructive: true },
    ],
    onSelect: () => {},
  },
};
