import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { ScrollArea } from "./ScrollArea";

describe("ScrollArea", () => {
  it("renders its content", () => {
    render(
      <ScrollArea>
        <div data-testid="content">content</div>
      </ScrollArea>,
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("applies a custom className to the root", () => {
    const { container } = render(
      <ScrollArea className="custom">
        <div>content</div>
      </ScrollArea>,
    );
    expect(container.querySelector(".b4-scroll-area")).toHaveClass("custom");
  });

  it("applies maxHeight to the root", () => {
    const { container } = render(
      <ScrollArea maxHeight={200}>
        <div>content</div>
      </ScrollArea>,
    );
    const root = container.querySelector(".b4-scroll-area") as HTMLElement;
    expect(root.style.maxHeight).toBe("200px");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ScrollArea>
        <div>content</div>
      </ScrollArea>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
