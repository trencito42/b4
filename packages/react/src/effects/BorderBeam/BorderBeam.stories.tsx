import type { Meta, StoryObj } from "@storybook/react-vite";
import { BorderBeam } from "./BorderBeam";
import { Card } from "../../components/Card/Card";

const meta: Meta<typeof BorderBeam> = {
  title: "Effects/BorderBeam",
  component: BorderBeam,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof BorderBeam>;

export const Default: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <BorderBeam>
        <Card>
          <p style={{ margin: 0, fontWeight: 600 }}>Awaiting confirmation</p>
          <p style={{ margin: "4px 0 0", color: "var(--b4-text-secondary)", fontSize: 13 }}>
            The beam travels the card's real rounded border.
          </p>
        </Card>
      </BorderBeam>
    </div>
  ),
};

export const Tones: Story = {
  render: () => (
    <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
      {(["accent", "success", "warning", "danger", "info"] as const).map((tone) => (
        <div key={tone} style={{ width: 160 }}>
          <BorderBeam tone={tone} duration={4}>
            <Card padding="sm">
              <p style={{ margin: 0, fontSize: 13 }}>{tone}</p>
            </Card>
          </BorderBeam>
        </div>
      ))}
    </div>
  ),
};

export const Inactive: Story = {
  render: () => (
    <div style={{ width: 280 }}>
      <BorderBeam active={false}>
        <Card>
          <p style={{ margin: 0 }}>No beam — `active={"{false}"}` renders the card alone.</p>
        </Card>
      </BorderBeam>
    </div>
  ),
};
