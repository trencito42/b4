import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { TransitionGroup } from "./TransitionGroup";
import { Button } from "../Button/Button";
import { Badge } from "../Badge/Badge";

const meta: Meta<typeof TransitionGroup> = {
  title: "Family E — Feedback & Motion/TransitionGroup",
  component: TransitionGroup,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof TransitionGroup>;

const TrashIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5} style={{ width: 14, height: 14 }}>
    <path d="M3 4h10M6 4V2.5A1.5 1.5 0 0 1 7.5 1h1A1.5 1.5 0 0 1 10 2.5V4M5 4v9a1.5 1.5 0 0 0 1.5 1.5h3A1.5 1.5 0 0 0 11 13V4" strokeLinecap="round" />
  </svg>
);

export const VerticalTaskList: Story = {
  render: () => {
    function TaskDemo() {
      const [tasks, setTasks] = useState([
        { id: "1", title: "Review production cluster metrics", priority: "high" },
        { id: "2", title: "Renew SSL wildcard certificates", priority: "medium" },
        { id: "3", title: "Migrate Postgres database to v16", priority: "low" },
      ]);
      const [counter, setCounter] = useState(4);

      return (
        <div style={{ maxWidth: 440 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <span style={{ fontSize: "var(--b4-text-sm)", fontWeight: "var(--b4-weight-semibold)", color: "var(--b4-text-primary)" }}>
              Active Tasks ({tasks.length})
            </span>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTasks((prev) => [
                  ...prev,
                  { id: String(counter), title: `Deploy canary worker node #${counter}`, priority: "medium" },
                ]);
                setCounter((c) => c + 1);
              }}
            >
              + Add Task
            </Button>
          </div>

          <TransitionGroup as="ul" direction="vertical" gap="md">
            {tasks.map((task) => (
              <div
                key={task.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  background: "var(--b4-surface-raised)",
                  border: "1px solid var(--b4-border-subtle)",
                  borderRadius: "var(--b4-radius-md)",
                  boxShadow: "var(--b4-shadow-card)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                  <Badge tone={task.priority === "high" ? "danger" : task.priority === "medium" ? "warning" : "neutral"}>
                    {task.priority}
                  </Badge>
                  <span style={{ fontSize: "var(--b4-text-sm)", color: "var(--b4-text-primary)", fontWeight: "var(--b4-weight-medium)" }}>
                    {task.title}
                  </span>
                </div>
                <button
                  type="button"
                  aria-label={`Remove ${task.title}`}
                  onClick={() => setTasks((prev) => prev.filter((t) => t.id !== task.id))}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 28,
                    height: 28,
                    border: "none",
                    borderRadius: "var(--b4-radius-sm)",
                    background: "transparent",
                    color: "var(--b4-text-tertiary)",
                    cursor: "pointer",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = "var(--b4-danger)";
                    e.currentTarget.style.background = "var(--b4-control-bg-hover)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = "var(--b4-text-tertiary)";
                    e.currentTarget.style.background = "transparent";
                  }}
                >
                  {TrashIcon}
                </button>
              </div>
            ))}
          </TransitionGroup>
        </div>
      );
    }
    return <TaskDemo />;
  },
};

export const HorizontalChipList: Story = {
  render: () => {
    function ChipDemo() {
      const [tags, setTags] = useState(["Production", "us-east-1", "K8s", "Postgres", "Redis"]);
      const [count, setCount] = useState(1);

      return (
        <div style={{ maxWidth: 500 }}>
          <div style={{ marginBottom: 12 }}>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => {
                setTags((prev) => [...prev, `Cluster-${count}`]);
                setCount((c) => c + 1);
              }}
            >
              + Add Filter Chip
            </Button>
          </div>
          <TransitionGroup as="ul" direction="horizontal" gap="sm">
            {tags.map((tag) => (
              <span
                key={tag}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  padding: "4px 10px",
                  background: "var(--b4-control-bg)",
                  border: "1px solid var(--b4-border-subtle)",
                  borderRadius: "var(--b4-radius-full)",
                  fontSize: "var(--b4-text-xs)",
                  color: "var(--b4-text-primary)",
                  fontWeight: "var(--b4-weight-medium)",
                }}
              >
                {tag}
                <button
                  type="button"
                  aria-label={`Remove ${tag}`}
                  onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "var(--b4-text-muted)",
                    cursor: "pointer",
                    padding: 0,
                    lineHeight: 1,
                    fontSize: 14,
                  }}
                >
                  ×
                </button>
              </span>
            ))}
          </TransitionGroup>
        </div>
      );
    }
    return <ChipDemo />;
  },
};
