import { useState, type CSSProperties } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TransitionGroup } from "./TransitionGroup";
import { Button } from "../Button/Button";

const meta: Meta<typeof TransitionGroup> = {
  title: "Family E — Feedback & Motion/TransitionGroup",
  component: TransitionGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TransitionGroup>;

const itemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "10px 14px",
  marginBottom: 8,
  background: "var(--b4-surface-overlay)",
  border: "1px solid var(--b4-border-subtle)",
  borderRadius: "var(--b4-radius-md)",
  color: "var(--b4-text-primary)",
  listStyle: "none",
};

export const ManagedList: Story = {
  render: () => {
    function Demo() {
      const [items, setItems] = useState(["Write report", "Review PR", "Reply to Ada"]);
      let nextId = items.length;

      return (
        <div style={{ width: 280 }}>
          <Button
            size="sm"
            onClick={() => setItems((prev) => [...prev, `New task ${nextId++}`])}
            style={{ marginBottom: 12 }}
          >
            Add item
          </Button>
          {/* TransitionGroup wraps each child in its own motion.li — the
              children passed here are the LIST ITEM CONTENT, not <li>
              elements themselves (that would nest <li> inside <li>). */}
          <TransitionGroup as="ul" style={{ margin: 0, padding: 0 }} itemClassName="transition-group-demo-item">
            {items.map((item, index) => (
              <span key={item} style={itemStyle}>
                <span style={{ flex: 1 }}>{item}</span>
                <button
                  type="button"
                  aria-label={`Remove ${item}`}
                  onClick={() => setItems((prev) => prev.filter((_, i) => i !== index))}
                  style={{ marginLeft: 12, border: "none", background: "transparent", cursor: "pointer", color: "var(--b4-text-tertiary)" }}
                >
                  ×
                </button>
              </span>
            ))}
          </TransitionGroup>
        </div>
      );
    }
    return <Demo />;
  },
};
