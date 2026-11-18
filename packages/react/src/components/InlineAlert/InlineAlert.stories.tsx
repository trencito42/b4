import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { InlineAlert } from "./InlineAlert";

const meta: Meta<typeof InlineAlert> = {
  title: "Family E — Feedback & Motion/InlineAlert",
  component: InlineAlert,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof InlineAlert>;

export const AllTones: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 12, width: 420 }}>
      <InlineAlert tone="info" title="Heads up">
        A new version of this page is available.
      </InlineAlert>
      <InlineAlert tone="success" title="Saved">
        Your changes were saved successfully.
      </InlineAlert>
      <InlineAlert tone="warning" title="Running low">
        Your storage is at 90% capacity.
      </InlineAlert>
      <InlineAlert tone="danger" title="Something went wrong">
        We couldn't process your request. Try again.
      </InlineAlert>
    </div>
  ),
};

export const Dismissible: Story = {
  render: () => {
    const [visible, setVisible] = useState(true);
    if (!visible) return <p>Dismissed.</p>;
    return (
      <InlineAlert tone="warning" title="Unsaved changes" dismissible onDismiss={() => setVisible(false)}>
        You have unsaved changes that will be lost.
      </InlineAlert>
    );
  },
};

export const WithoutTitle: Story = {
  args: {
    tone: "info",
    children: "No title — just a message.",
  },
};
