import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AvatarGroup } from "./AvatarGroup";

const people = [
  { name: "Ada Lovelace" },
  { name: "Grace Hopper" },
  { name: "Margaret Hamilton" },
  { name: "Katherine Johnson" },
  { name: "Radia Perlman" },
];

describe("AvatarGroup", () => {
  it("renders up to max avatars and collapses the rest into a real count", () => {
    render(<AvatarGroup people={people} max={3} />);
    expect(screen.getByRole("img", { name: "Ada Lovelace" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Grace Hopper" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Margaret Hamilton" })).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: "Katherine Johnson" })).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "2 more people" })).toBeInTheDocument();
  });

  it("shows no overflow indicator when everyone fits", () => {
    render(<AvatarGroup people={people.slice(0, 2)} max={4} />);
    expect(screen.queryByText(/\+/)).not.toBeInTheDocument();
  });

  it("has no axe violations", async () => {
    const { container } = render(<AvatarGroup people={people} max={3} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
