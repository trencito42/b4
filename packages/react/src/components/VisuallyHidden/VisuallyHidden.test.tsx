import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { VisuallyHidden } from "./VisuallyHidden";

describe("VisuallyHidden", () => {
  it("renders its content, accessible via text queries", () => {
    render(<VisuallyHidden>Add item</VisuallyHidden>);
    expect(screen.getByText("Add item")).toBeInTheDocument();
  });

  it("renders a span by default", () => {
    render(<VisuallyHidden>Add item</VisuallyHidden>);
    expect(screen.getByText("Add item").tagName).toBe("SPAN");
  });

  it("supports a custom element via `as`", () => {
    render(<VisuallyHidden as="label">Quantity</VisuallyHidden>);
    expect(screen.getByText("Quantity").tagName).toBe("LABEL");
  });

  it("applies a custom className", () => {
    render(<VisuallyHidden className="custom">hi</VisuallyHidden>);
    expect(screen.getByText("hi")).toHaveClass("custom");
  });

  it("has no axe violations", async () => {
    const { container } = render(<VisuallyHidden>Add item</VisuallyHidden>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
