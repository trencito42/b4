import type { Meta, StoryObj } from "@storybook/react-vite";
import { ToastProvider, useToast } from "./Toast";
import { Button } from "../Button/Button";

const meta: Meta<typeof ToastProvider> = {
  title: "Family E — Feedback & Motion/Toast",
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof ToastProvider>;

function Demo() {
  const toast = useToast();
  return (
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
      <Button
        onClick={() =>
          toast.add({ title: "Changes saved", description: "Your draft is up to date.", type: "success" })
        }
      >
        Save
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: "Item deleted",
            type: "warning",
            actionProps: {
              children: "Undo",
              onClick: () => toast.add({ title: "Delete undone" }),
            },
          })
        }
      >
        Delete with undo
      </Button>
      <Button
        variant="destructive"
        onClick={() => toast.add({ title: "Upload failed", description: "Check your connection.", type: "error" })}
      >
        Fail
      </Button>
      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 2000)), {
            loading: "Uploading…",
            success: "Upload complete",
            error: "Upload failed",
          })
        }
      >
        Async (promise)
      </Button>
    </div>
  );
}

export const Default: Story = {
  render: () => (
    <ToastProvider>
      <Demo />
    </ToastProvider>
  ),
};
