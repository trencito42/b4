import type { Meta, StoryObj } from "@storybook/react-vite";
import { ResizablePanels } from "./ResizablePanels";

const meta: Meta<typeof ResizablePanels> = {
  title: "Family F — Application Patterns/ResizablePanels",
  component: ResizablePanels,
  tags: ["autodocs"],
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
 * The Studio catalog deep-links every component to its `--default`
 * story, so each component must publish one under that exact name.
 * This is an alias of the primary example above — the same story under
 * a stable name the catalog (and any external link) can rely on.
 */
export const Default = Horizontal;
