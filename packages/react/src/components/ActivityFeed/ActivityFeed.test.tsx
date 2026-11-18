import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ActivityFeed } from "./ActivityFeed";

const items = [
  { id: "1", actorName: "Ada Lovelace", action: "merged pull request #248", timestamp: "2 hours ago" },
  { id: "2", actorName: "Grace Hopper", action: "commented on issue #12" },
];

describe("ActivityFeed", () => {
  it("renders as an ordered list with one item per entry", () => {
    render(<ActivityFeed items={items} />);
    expect(screen.getByRole("list").tagName).toBe("OL");
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
  });

  it("renders each item's actor name, action and avatar", () => {
    render(<ActivityFeed items={items} />);
    expect(screen.getByText("Ada Lovelace")).toBeInTheDocument();
    expect(screen.getByText("merged pull request #248")).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument();
  });

  it("renders a timestamp when provided and omits it otherwise", () => {
    render(<ActivityFeed items={items} />);
    expect(screen.getByText("2 hours ago")).toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<ActivityFeed items={items} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
