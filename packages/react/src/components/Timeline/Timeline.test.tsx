import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Timeline } from "./Timeline";

const items = [
  { id: "1", title: "Deployment succeeded", timestamp: "2 hours ago", tone: "success" as const },
  { id: "2", title: "Build started", description: "Triggered by push to main", timestamp: "3 hours ago" },
];

describe("Timeline", () => {
  it("renders as an ordered list", () => {
    render(<Timeline items={items} />);
    expect(screen.getByRole("list").tagName).toBe("OL");
  });

  it("renders one list item per entry", () => {
    render(<Timeline items={items} />);
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders each item's title, timestamp and description", () => {
    render(<Timeline items={items} />);
    expect(screen.getByText("Deployment succeeded")).toBeInTheDocument();
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
    expect(screen.getByText("Triggered by push to main")).toBeInTheDocument();
  });

  it("has no axe violations across the tone matrix", async () => {
    const toned = ["neutral", "success", "warning", "danger", "info"] as const;
    const { container } = render(
      <Timeline
        items={toned.map((tone, i) => ({ id: String(i), title: `Item ${tone}`, tone }))}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
