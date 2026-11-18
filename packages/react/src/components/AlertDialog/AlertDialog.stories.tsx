import type { Meta, StoryObj } from "@storybook/react-vite";
import { AlertDialog } from "./AlertDialog";
import { Button } from "../Button/Button";

const meta: Meta<typeof AlertDialog> = {
  title: "Family C — Navigation & Overlays/AlertDialog",
  component: AlertDialog,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AlertDialog>;

export const Default: Story = {
  args: {
    trigger: <Button variant="destructive">Delete project</Button>,
    title: "Delete this project?",
    description: "This action can't be undone. All data will be permanently removed.",
    confirmLabel: "Delete permanently",
    onConfirm: () => console.log("confirmed"),
  },
};

export const CustomCancelLabel: Story = {
  args: {
    trigger: <Button variant="destructive">Revoke access</Button>,
    title: "Revoke API access?",
    cancelLabel: "Keep access",
    confirmLabel: "Revoke",
    onConfirm: () => console.log("revoked"),
  },
};
