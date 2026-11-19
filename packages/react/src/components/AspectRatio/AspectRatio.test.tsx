import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { AspectRatio } from "./AspectRatio";

describe("AspectRatio", () => {
  it("renders its children", () => {
    render(
      <AspectRatio>
        <div data-testid="content">content</div>
      </AspectRatio>,
    );
    expect(screen.getByTestId("content")).toBeInTheDocument();
  });

  it("applies the ratio as a CSS aspect-ratio style, defaulting to 1", () => {
    const { container } = render(
      <AspectRatio>
        <div />
      </AspectRatio>,
    );
    const root = container.querySelector(".b4-aspect-ratio") as HTMLElement;
    expect(root.style.aspectRatio).toContain("1");
  });

  it("applies a custom ratio", () => {
    const { container } = render(
      <AspectRatio ratio={16 / 9}>
        <div />
      </AspectRatio>,
    );
    const root = container.querySelector(".b4-aspect-ratio") as HTMLElement;
    expect(root.style.aspectRatio).toContain("1.77");
  });

  it("applies a custom className", () => {
    const { container } = render(
      <AspectRatio className="custom">
        <div />
      </AspectRatio>,
    );
    expect(container.querySelector(".b4-aspect-ratio")).toHaveClass("custom");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <AspectRatio>
        <div>content</div>
      </AspectRatio>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
