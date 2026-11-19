import type { Meta, StoryObj } from "@storybook/react-vite";
import { useState } from "react";
import { AnimatedIndicator } from "./AnimatedIndicator";

const meta: Meta<typeof AnimatedIndicator> = {
  title: "Family E — Feedback & Motion/AnimatedIndicator",
  component: AnimatedIndicator,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof AnimatedIndicator>;

/**
 * The underlying primitive behind SegmentedControl's traveling capsule.
 * Any component that needs a "soft substantial surface that moves to the
 * active item" (tab underlines, list-selection highlights, nav indicators)
 * should use this instead of re-implementing the layoutId pattern.
 */
export const BetweenTwoTargets: Story = {
  render: () => {
    function Demo() {
      const [selected, setSelected] = useState<"a" | "b">("a");
      const itemStyle = (isSelected: boolean) => ({
        position: "relative" as const,
        padding: "10px 20px",
        borderRadius: "var(--b4-control-radius)",
        color: isSelected ? "var(--b4-control-fg-selected)" : "var(--b4-control-fg)",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        zIndex: 1,
      });

      return (
        <div
          style={{
            display: "inline-flex",
            gap: 2,
            padding: 4,
            background: "var(--b4-control-bg)",
            borderRadius: "var(--b4-control-radius)",
          }}
        >
          <button style={itemStyle(selected === "a")} onClick={() => setSelected("a")}>
            {selected === "a" && (
              <AnimatedIndicator
                layoutId="story-indicator"
                data-testid="story-indicator"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--b4-control-bg-selected)",
                  borderRadius: "var(--b4-control-radius)",
                  zIndex: -1,
                }}
              />
            )}
            A
          </button>
          <button style={itemStyle(selected === "b")} onClick={() => setSelected("b")}>
            {selected === "b" && (
              <AnimatedIndicator
                layoutId="story-indicator"
                data-testid="story-indicator"
                style={{
                  position: "absolute",
                  inset: 0,
                  background: "var(--b4-control-bg-selected)",
                  borderRadius: "var(--b4-control-radius)",
                  zIndex: -1,
                }}
              />
            )}
            B
          </button>
        </div>
      );
    }

    return <Demo />;
  },
};

/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = BetweenTwoTargets;
