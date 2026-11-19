import type { Meta, StoryObj } from "@storybook/react-vite";
import { DistortionWave } from "./DistortionWave";
import { Card } from "../../components/Card/Card";

const meta: Meta<typeof DistortionWave> = {
  title: "Effects/DistortionWave",
  component: DistortionWave,
  tags: ["autodocs"],
  argTypes: {
    active: { control: "boolean", description: "Whether the wave is running." },
    amplitude: {
      control: "select",
      options: ["sm", "md", "lg"],
      description: "Strength of the refraction the wave applies to what it passes over.",
    },
    direction: {
      control: "inline-radio",
      options: ["horizontal", "vertical"],
      description: "Axis the wave travels along.",
    },
    tone: {
      control: "select",
      options: ["accent", "success", "warning", "danger", "info"],
      description: "Tint of the wave's chromatic edge.",
    },
    duration: { control: { type: "number", min: 1, max: 20, step: 0.5 }, description: "Seconds per full sweep." },
  },
  args: {
    active: true,
    amplitude: "md",
    direction: "horizontal",
    tone: "accent",
    duration: 6,
  },
};

export default meta;
type Story = StoryObj<typeof DistortionWave>;

const sample = (
  <Card>
    <p style={{ margin: 0, fontWeight: 600 }}>Deploy pipeline</p>
    <p style={{ margin: "4px 0 0", color: "var(--b4-text-secondary)", fontSize: 13 }}>
      The wave refracts this text while it passes, then lets it resolve again.
    </p>
  </Card>
);

export const Default: Story = {
  render: (args) => (
    <div style={{ width: 280 }}>
      <DistortionWave {...args}>{sample}</DistortionWave>
    </div>
  ),
};

export const AllVariants: Story = {
  name: "All variants",
  render: (args) => (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))" }}>
      {(["sm", "md", "lg"] as const).map((amplitude) => (
        <div key={amplitude}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--b4-text-tertiary)" }}>amplitude: {amplitude}</p>
          <DistortionWave {...args} amplitude={amplitude}>
            {sample}
          </DistortionWave>
        </div>
      ))}
    </div>
  ),
};

export const Tones: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))" }}>
      {(["accent", "success", "warning", "danger", "info"] as const).map((tone) => (
        <div key={tone}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--b4-text-tertiary)" }}>{tone}</p>
          <DistortionWave {...args} tone={tone}>
            {sample}
          </DistortionWave>
        </div>
      ))}
    </div>
  ),
};

export const Directions: Story = {
  render: (args) => (
    <div style={{ display: "grid", gap: 20, gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))" }}>
      {(["horizontal", "vertical"] as const).map((direction) => (
        <div key={direction}>
          <p style={{ margin: "0 0 8px", fontSize: 12, color: "var(--b4-text-tertiary)" }}>{direction}</p>
          <DistortionWave {...args} direction={direction}>
            {sample}
          </DistortionWave>
        </div>
      ))}
    </div>
  ),
};

export const Inactive: Story = {
  render: (args) => (
    <div style={{ width: 280 }}>
      {/* Do: `active={false}` removes the effect entirely, leaving the
          child completely untouched. Don't: "turn the wave down" by
          lowering the amplitude to nothing — use `active`, so the child is
          never left sitting behind a band of frosted glass. */}
      <DistortionWave {...args} active={false}>
        {sample}
      </DistortionWave>
    </div>
  ),
};
