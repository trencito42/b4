import type { Meta, StoryObj } from "@storybook/react-vite";
import { useRef, useState } from "react";
import { DistortionWave } from "./DistortionWave";
import type { DistortionWaveType } from "./types";
import { Card } from "../../components/Card/Card";
import { Badge } from "../../components/Badge/Badge";
import { Button } from "../../components/Button/Button";
import { SegmentedControl } from "../../components/SegmentedControl/SegmentedControl";

const meta: Meta<typeof DistortionWave> = {
  title: "Effects/DistortionWave",
  component: DistortionWave,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "A real WebGL2 dual-view transition: two React views are each captured to a canvas, uploaded as GPU textures, and a fragment shader displaces the UV coordinates it samples them through along a travelling wavefront — not a CSS filter. See docs/effects/DISTORTION_WAVE.md.",
      },
    },
  },
};

export default meta;
type Story = StoryObj<typeof DistortionWave>;

function PaymentDemo({ type }: { type: DistortionWaveType }) {
  const [sent, setSent] = useState(false);
  const confirmRef = useRef<HTMLButtonElement>(null);

  return (
    <DistortionWave
      revealed={sent}
      source={confirmRef}
      type={type}
      palette="colorful"
      cornerRadius="var(--b4-radius-lg)"
      overlay={
        !sent ? (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 16 }}>
            <Button ref={confirmRef} variant="primary" size="sm" onClick={() => setSent(true)}>
              Confirm
            </Button>
          </div>
        ) : (
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 16 }}>
            <Button variant="secondary" size="sm" onClick={() => setSent(false)}>
              Reset
            </Button>
          </div>
        )
      }
      revealedContent={
        <Card variant="raised" padding="lg" style={{ width: 320 }}>
          <Badge tone="success">Sent</Badge>
          <h4 style={{ margin: "8px 0 4px", fontSize: "var(--b4-text-lg)" }}>$1,250.00</h4>
          <p style={{ margin: 0, color: "var(--b4-text-secondary)" }}>Payment complete</p>
        </Card>
      }
    >
      <Card variant="raised" padding="lg" style={{ width: 320 }}>
        <Badge tone="accent">Review</Badge>
        <h4 style={{ margin: "8px 0 4px", fontSize: "var(--b4-text-lg)" }}>$1,250.00</h4>
        <p style={{ margin: 0, color: "var(--b4-text-secondary)" }}>To Maya Chen · Studio rent</p>
      </Card>
    </DistortionWave>
  );
}

export const Default: Story = {
  render: () => <PaymentDemo type="vertical" />,
};

export const PaymentConfirmation: Story = {
  render: () => <PaymentDemo type="vertical" />,
};

export const Geometries: Story = {
  render: function Render() {
    const [type, setType] = useState<DistortionWaveType>("vertical");
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "flex-start" }}>
        <SegmentedControl
          aria-label="Wave geometry"
          size="sm"
          items={[
            { value: "vertical", label: "Vertical" },
            { value: "horizontal", label: "Horizontal" },
            { value: "center", label: "Center" },
          ]}
          value={type}
          onValueChange={(v) => {
            if (v) setType(v as DistortionWaveType);
          }}
        />
        <PaymentDemo key={type} type={type} />
      </div>
    );
  },
};

export const ReducedMotion: Story = {
  render: () => {
    function Demo() {
      const [sent, setSent] = useState(false);
      const confirmRef = useRef<HTMLButtonElement>(null);
      return (
        <DistortionWave
          revealed={sent}
          source={confirmRef}
          reducedMotion
          overlay={
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "flex-end", justifyContent: "flex-end", padding: 16 }}>
              <Button ref={confirmRef} variant="primary" size="sm" onClick={() => setSent((s) => !s)}>
                {sent ? "Reset" : "Confirm"}
              </Button>
            </div>
          }
          revealedContent={
            <Card variant="raised" padding="lg" style={{ width: 280 }}>
              Payment complete
            </Card>
          }
        >
          <Card variant="raised" padding="lg" style={{ width: 280 }}>
            Review payment
          </Card>
        </DistortionWave>
      );
    }
    return <Demo />;
  },
};
