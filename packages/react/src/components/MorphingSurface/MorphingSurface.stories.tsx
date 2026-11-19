import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { MorphingSurface } from "./MorphingSurface";

const meta: Meta<typeof MorphingSurface> = {
  title: "Family E — Feedback & Motion/MorphingSurface",
  component: MorphingSurface,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MorphingSurface>;

const surfaceStyle = {
  background: "var(--b4-surface-overlay)",
  border: "1px solid var(--b4-border-subtle)",
  borderRadius: "var(--b4-radius-md)",
  padding: 16,
  color: "var(--b4-text-primary)",
};

export const ExpandInPlace: Story = {
  name: "Expand in place (size/position morph, no layoutId)",
  render: () => {
    function Demo() {
      const [expanded, setExpanded] = useState(false);
      return (
        <MorphingSurface
          data-testid="morph-surface"
          style={{ ...surfaceStyle, width: expanded ? 360 : 200, cursor: "pointer" }}
          onClick={() => setExpanded((prev) => !prev)}
        >
          {expanded ? "Expanded content — click to collapse." : "Click to expand"}
        </MorphingSurface>
      );
    }
    return <Demo />;
  },
};

export const SharedLayoutId: Story = {
  name: "Shared layoutId (two different mount points)",
  render: () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      if (open) {
        return (
          <MorphingSurface
            data-testid="morph-surface"
            layoutId="story-card"
            style={{ ...surfaceStyle, width: 320, cursor: "pointer" }}
            onClick={() => setOpen(false)}
          >
            <strong>Expanded detail</strong>
            <p style={{ margin: "8px 0 0" }}>Click to collapse back to the list item.</p>
          </MorphingSurface>
        );
      }
      return (
        <MorphingSurface
          data-testid="morph-surface"
          layoutId="story-card"
          style={{ ...surfaceStyle, width: 160, cursor: "pointer" }}
          onClick={() => setOpen(true)}
        >
          List item — click
        </MorphingSurface>
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
export const Default: Story = ExpandInPlace;
