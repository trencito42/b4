import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { TextTransition } from "./TextTransition";

const meta: Meta<typeof TextTransition> = {
  title: "Family E — Feedback & Motion/TextTransition",
  component: TextTransition,
  tags: ["autodocs"],
  argTypes: {
    mode: { control: "inline-radio", options: ["crossfade", "vertical", "horizontal", "morph"] },
    direction: { control: "inline-radio", options: ["forward", "backward"] },
  },
};

export default meta;
type Story = StoryObj<typeof TextTransition>;

function CyclingDemo({ mode }: { mode: "crossfade" | "vertical" | "horizontal" }) {
  const words = ["Deploying", "Building", "Verifying", "Live"];
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % words.length), 1400);
    return () => clearInterval(id);
  }, []);

  return (
    <span style={{ fontSize: "var(--b4-text-xl)", fontWeight: "var(--b4-weight-semibold)" }}>
      <TextTransition value={words[index] ?? ""} mode={mode} />
    </span>
  );
}

export const Crossfade: Story = { render: () => <CyclingDemo mode="crossfade" /> };
export const Vertical: Story = { render: () => <CyclingDemo mode="vertical" /> };
export const Horizontal: Story = { render: () => <CyclingDemo mode="horizontal" /> };

/**
 * Do: key the transition on content identity (`value`), not on an
 * unrelated render trigger. Don't: wrap already-static text in
 * TextTransition "just in case" — it's for values that actually change.
 */
export const ManualControl: Story = {
  render: () => {
    function Demo() {
      const [label, setLabel] = useState("Idle");
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "var(--b4-text-lg)" }}>
            <TextTransition value={label} mode="vertical" />
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            {["Idle", "Pending", "Success", "Error"].map((l) => (
              <button
                key={l}
                onClick={() => setLabel(l)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "var(--b4-control-radius)",
                  border: "none",
                  background: "var(--b4-control-bg)",
                  color: "var(--b4-text-primary)",
                  cursor: "pointer",
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      );
    }
    return <Demo />;
  },
};


/**
 * The "AllModes" overview: every variant of this component, side by
 * side, so they can be compared without clicking through the controls.
 */
export const AllModes: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {(["crossfade", "vertical", "horizontal", "morph"] as const).map((mode) => (
        <span key={mode} style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
          <code style={{ color: "var(--b4-text-tertiary)", fontSize: 12 }}>{mode}</code>
          <TextTransition mode={mode} value="Deploying changes" />
        </span>
      ))}
    </div>
  ),
};
/**
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default: Story = Crossfade;
