import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Card } from "./Card";

describe("Card", () => {
  it("renders its children", () => {
    render(<Card>Hello</Card>);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });

  it("defaults to the flat variant and md padding", () => {
    const { container } = render(<Card>Hello</Card>);
    expect(container.firstChild).toHaveClass("b4-card--flat", "b4-card--padding-md");
  });

  it("applies the requested variant and padding", () => {
    const { container } = render(<Card variant="outlined" padding="lg">Hello</Card>);
    expect(container.firstChild).toHaveClass("b4-card--outlined", "b4-card--padding-lg");
  });

  it("has no axe violations across the variant matrix", async () => {
    for (const variant of ["flat", "raised", "outlined"] as const) {
      const { container, unmount } = render(<Card variant={variant}>Hello</Card>);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
