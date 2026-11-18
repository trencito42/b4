import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { axe } from "jest-axe";
import { Skeleton } from "./Skeleton";

describe("Skeleton", () => {
  it("is hidden from assistive tech", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveAttribute("aria-hidden", "true");
  });

  it("defaults to the text variant", () => {
    const { container } = render(<Skeleton />);
    expect(container.firstChild).toHaveClass("b4-skeleton--text");
  });

  it("applies the requested variant", () => {
    const { container } = render(<Skeleton variant="circle" />);
    expect(container.firstChild).toHaveClass("b4-skeleton--circle");
  });

  it("applies a custom width and height", () => {
    const { container } = render(<Skeleton width={200} height="2rem" />);
    const el = container.firstChild as HTMLElement;
    // Assert the raw inline style, not the jsdom-computed value — jsdom
    // resolves "2rem" against its default 16px root font-size (32px),
    // which is a jsdom quirk, not something this component controls.
    expect(el.style.width).toBe("200px");
    expect(el.style.height).toBe("2rem");
  });

  it("has no axe violations across the variant matrix", async () => {
    for (const variant of ["text", "circle", "rect"] as const) {
      const { container, unmount } = render(<Skeleton variant={variant} />);
      expect(await axe(container)).toHaveNoViolations();
      unmount();
    }
  });
});
