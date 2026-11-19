import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { LoadingOverlay } from "./LoadingOverlay";
import { Button } from "../Button/Button";

const meta: Meta<typeof LoadingOverlay> = {
  title: "Family E — Feedback & Motion/LoadingOverlay",
  component: LoadingOverlay,
  tags: ["autodocs"],
  argTypes: {
    variant: { control: "inline-radio", options: ["absolute"] },
  },
};

export default meta;
type Story = StoryObj<typeof LoadingOverlay>;

export const OverContent: Story = {
  render: () => {
    function Demo() {
      const [loading, setLoading] = useState(false);
      return (
        <div>
          <Button onClick={() => setLoading(true)}>Start loading</Button>
          <div
            style={{
              position: "relative",
              marginTop: 16,
              width: 320,
              height: 180,
              border: "1px solid var(--b4-border-subtle)",
              borderRadius: "var(--b4-radius-md)",
              padding: 16,
            }}
          >
            <p>Real content behind the overlay — try clicking it while loading.</p>
            <Button onClick={() => alert("clicked")}>Click me</Button>
            <LoadingOverlay visible={loading} message="Fetching data…" />
          </div>
          {loading && (
            <Button variant="secondary" onClick={() => setLoading(false)} style={{ marginTop: 12 }}>
              Stop loading
            </Button>
          )}
        </div>
      );
    }
    return <Demo />;
  },
};

export const SpinnerOnly: Story = {
  args: { visible: true },
};


/**
 * The "AllVariants" overview: every variant of this component, side by
 * side, so they can be compared without clicking through the controls.
 */
export const AllVariants: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      <div
        style={{
          position: "relative",
          width: 220,
          height: 140,
          borderRadius: "var(--b4-radius-md)",
          border: "1px solid var(--b4-border-subtle)",
        }}
      >
        <LoadingOverlay visible variant="absolute" message="absolute" />
      </div>
      {/* A transformed ancestor becomes the containing block for a
          position:fixed descendant, so the fixed variant can be shown
          side by side with the absolute one instead of covering the
          whole iframe. */}
      <div
        style={{
          position: "relative",
          transform: "translateZ(0)",
          width: 220,
          height: 140,
          borderRadius: "var(--b4-radius-md)",
          border: "1px solid var(--b4-border-subtle)",
        }}
      >
        <LoadingOverlay visible variant="fixed" message="fixed" />
      </div>
    </div>
  ),
};
/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = OverContent;
