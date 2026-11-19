import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResizablePanels } from "./ResizablePanels";

const meta: Meta<typeof ResizablePanels> = {
  title: "Family F — Application Patterns/ResizablePanels",
  component: ResizablePanels,
  tags: ["autodocs"],
  argTypes: {
    orientation: { control: "inline-radio", options: ["horizontal"] },
  },
  parameters: { layout: "fullscreen" },
};

export default meta;
type Story = StoryObj<typeof ResizablePanels>;

const panelStyle = { padding: 16, color: "var(--b4-text-secondary)" };

export const Horizontal: Story = {
  render: () => (
    <div style={{ height: 320 }}>
      <ResizablePanels aria-label="Resize panels">
        <div style={panelStyle}>Left panel</div>
        <div style={panelStyle}>Right panel</div>
      </ResizablePanels>
    </div>
  ),
};

export const Vertical: Story = {
  render: () => (
    <div style={{ height: 320 }}>
      <ResizablePanels aria-label="Resize panels" orientation="vertical" defaultSplit={30}>
        <div style={panelStyle}>Top panel</div>
        <div style={panelStyle}>Bottom panel</div>
      </ResizablePanels>
    </div>
  ),
};


/**
 * The "AllOrientations" overview: every variant of this component, side by
 * side, so they can be compared without clicking through the controls.
 */
export const AllOrientations: Story = {
  render: () => (
    <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      {(["horizontal", "vertical"] as const).map((orientation) => (
        <div key={orientation} style={{ height: 160 }}>
          <ResizablePanels orientation={orientation} aria-label="Example panels">
            <div style={{ padding: "var(--b4-space-4)" }}>First panel</div>
            <div style={{ padding: "var(--b4-space-4)" }}>Second panel</div>
          </ResizablePanels>
        </div>
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
export const Default: Story = Horizontal;
