import type { Meta, StoryObj } from "@storybook/react-vite";
import { useEffect, useState } from "react";
import { NumberTransition } from "./NumberTransition";

const meta: Meta<typeof NumberTransition> = {
  title: "Family E — Feedback & Motion/NumberTransition",
  component: NumberTransition,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof NumberTransition>;

export const Static: Story = { args: { value: 1284 } };

export const CountingUp: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(1200);
      useEffect(() => {
        const id = setInterval(() => setValue((v) => v + 17), 900);
        return () => clearInterval(id);
      }, []);
      return (
        <span style={{ fontSize: "var(--b4-text-3xl)", fontWeight: "var(--b4-weight-semibold)" }}>
          <NumberTransition value={value} />
        </span>
      );
    }
    return <Demo />;
  },
};

export const CurrencyFormat: Story = {
  args: {
    value: 4899,
    format: (n: number) => `$${(n / 100).toFixed(2)}`,
  },
};

export const UpAndDown: Story = {
  render: () => {
    function Demo() {
      const [value, setValue] = useState(100);
      return (
        <div style={{ display: "flex", flexDirection: "column", gap: 12, alignItems: "flex-start" }}>
          <span style={{ fontSize: "var(--b4-text-2xl)" }}>
            <NumberTransition value={value} />
          </span>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setValue((v) => v - 7)}>-7</button>
            <button onClick={() => setValue((v) => v + 7)}>+7</button>
          </div>
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
export const Default = Static;
