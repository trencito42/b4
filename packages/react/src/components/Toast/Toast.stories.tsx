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
    <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "center" }}>
      <Button
        variant="primary"
        onClick={() =>
          toast.add({
            title: "Deployment complete",
            description: "Production cluster us-east-1 is healthy and serving traffic.",
            type: "success",
          })
        }
      >
        Success toast
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          toast.add({
            title: "Instance deleted",
            description: "Worker node 'worker-88a' has been terminated.",
            type: "warning",
            actionProps: {
              children: "Undo",
              onClick: () =>
                toast.add({
                  title: "Action reversed",
                  description: "Worker node has been restored.",
                  type: "info",
                }),
            },
          })
        }
      >
        Warning with undo
      </Button>

      <Button
        variant="destructive"
        onClick={() =>
          toast.add({
            title: "Connection timeout",
            description: "Failed to establish SSL handshake with Redis cluster.",
            type: "error",
          })
        }
      >
        Error toast
      </Button>

      <Button
        variant="secondary"
        onClick={() =>
          toast.promise(new Promise((resolve) => setTimeout(resolve, 2200)), {
            loading: "Provisioning database snapshot…",
            success: "Snapshot created and encrypted",
            error: "Snapshot generation failed",
          })
        }
      >
        Async promise sequence
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
