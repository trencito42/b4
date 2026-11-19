import { describe, expect, it } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { useState } from "react";
import { MorphingSurface } from "./MorphingSurface";
import { axe } from "jest-axe";

describe("MorphingSurface", () => {
  it("renders as a div by default and forwards className/children", () => {
    render(
      <MorphingSurface className="custom" data-testid="surface">
        Content
      </MorphingSurface>,
    );
    const el = screen.getByTestId("surface");
    expect(el.tagName).toBe("DIV");
    expect(el).toHaveClass("custom");
    expect(el).toHaveTextContent("Content");
  });

  it("renders as a span when as='span'", () => {
    render(
      <MorphingSurface as="span" data-testid="surface">
        Content
      </MorphingSurface>,
    );
    expect(screen.getByTestId("surface").tagName).toBe("SPAN");
  });

  it("updates its content when its own state-driven props change (size/position morph)", () => {
    function Demo() {
      const [expanded, setExpanded] = useState(false);
      return (
        <MorphingSurface data-testid="surface" onClick={() => setExpanded((p) => !p)}>
          {expanded ? "Expanded" : "Collapsed"}
        </MorphingSurface>
      );
    }
    render(<Demo />);

    expect(screen.getByTestId("surface")).toHaveTextContent("Collapsed");
    fireEvent.click(screen.getByTestId("surface"));
    expect(screen.getByTestId("surface")).toHaveTextContent("Expanded");
  });

  it("renders exactly one element at a time for a shared layoutId as it moves between two mount points", () => {
    function Demo() {
      const [open, setOpen] = useState(false);
      return open ? (
        <MorphingSurface layoutId="shared" data-testid="surface" onClick={() => setOpen(false)}>
          Detail
        </MorphingSurface>
      ) : (
        <MorphingSurface layoutId="shared" data-testid="surface" onClick={() => setOpen(true)}>
          List item
        </MorphingSurface>
      );
    }
    render(<Demo />);

    expect(screen.getAllByTestId("surface")).toHaveLength(1);
    expect(screen.getByTestId("surface")).toHaveTextContent("List item");

    fireEvent.click(screen.getByTestId("surface"));

    expect(screen.getAllByTestId("surface")).toHaveLength(1);
    expect(screen.getByTestId("surface")).toHaveTextContent("Detail");
  });
  // Structural accessibility is asserted here. Colour-contrast cannot be:
  // jsdom loads no stylesheet, so a colour-contrast rule would be testing
  // nothing — the real contrast check runs in the Playwright suite against
  // both themes with rendered CSS. See TESTING.md.
  it("has no axe violations", async () => {
    const { container } = render(<MorphingSurface>Content</MorphingSurface>);
    expect(await axe(container)).toHaveNoViolations();
  });
});
