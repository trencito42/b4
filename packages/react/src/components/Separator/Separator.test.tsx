import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { Separator } from "./Separator";

describe("Separator", () => {
  it("renders with role=separator and horizontal orientation by default", () => {
    render(<Separator />);
    const el = screen.getByRole("separator");
    expect(el).toHaveClass("b4-separator--horizontal");
  });

  it("supports vertical orientation", () => {
    render(<Separator orientation="vertical" />);
    const el = screen.getByRole("separator");
    expect(el).toHaveAttribute("aria-orientation", "vertical");
    expect(el).toHaveClass("b4-separator--vertical");
  });

  it("applies a custom className", () => {
    render(<Separator className="custom-sep" />);
    expect(screen.getByRole("separator")).toHaveClass("custom-sep");
  });

  it("has no axe violations", async () => {
    const { container } = render(<Separator />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
