import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { RefractionSweep } from "./RefractionSweep";

vi.mock("@b4/motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@b4/motion")>();
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from "@b4/motion";

describe("RefractionSweep", () => {
  afterEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders its children unchanged", () => {
    render(
      <RefractionSweep>
        <button type="button">Confirm</button>
      </RefractionSweep>,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("renders the wave layer as aria-hidden, so it's invisible to assistive tech", () => {
    const { container } = render(
      <RefractionSweep>
        <span>Card</span>
      </RefractionSweep>,
    );
    const layer = container.querySelector(".b4-refraction-sweep__layer");
    expect(layer).toHaveAttribute("aria-hidden", "true");
  });

  it("renders no wave layer at all when inactive", () => {
    const { container } = render(
      <RefractionSweep active={false}>
        <span>Card</span>
      </RefractionSweep>,
    );
    expect(container.querySelector(".b4-refraction-sweep__layer")).toBeNull();
  });

  it("applies the requested amplitude, tone and duration as CSS custom properties", () => {
    const { container } = render(
      <RefractionSweep amplitude="lg" tone="danger" duration={3}>
        <span>Card</span>
      </RefractionSweep>,
    );
    const layer = container.querySelector(".b4-refraction-sweep__layer") as HTMLElement;
    expect(layer.style.getPropertyValue("--b4-refraction-sweep-blur")).toBe("7px");
    expect(layer.style.getPropertyValue("--b4-refraction-sweep-saturate")).toBe("1.7");
    expect(layer.style.getPropertyValue("--b4-refraction-sweep-tone")).toBe("var(--b4-danger-text)");
    expect(layer.style.getPropertyValue("--b4-refraction-sweep-duration")).toBe("3s");
  });

  it("marks the layer as moving when active and motion is allowed", () => {
    const { container } = render(
      <RefractionSweep>
        <span>Card</span>
      </RefractionSweep>,
    );
    const layer = container.querySelector(".b4-refraction-sweep__layer");
    expect(layer).toHaveClass("b4-refraction-sweep__layer--moving");
  });

  it("holds the layer still under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(
      <RefractionSweep>
        <span>Card</span>
      </RefractionSweep>,
    );
    const layer = container.querySelector(".b4-refraction-sweep__layer");
    expect(layer).not.toHaveClass("b4-refraction-sweep__layer--moving");
    expect(layer).toHaveClass("b4-refraction-sweep__layer--static");
  });

  it("applies the travel direction as a modifier class", () => {
    const { container } = render(
      <RefractionSweep direction="vertical">
        <span>Card</span>
      </RefractionSweep>,
    );
    expect(container.querySelector(".b4-refraction-sweep")).toHaveClass("b4-refraction-sweep--vertical");
  });

  it("forwards its ref to the wrapper element", () => {
    const ref = { current: null as HTMLDivElement | null };
    render(
      <RefractionSweep ref={ref}>
        <span>Card</span>
      </RefractionSweep>,
    );
    expect(ref.current).toBeInstanceOf(HTMLDivElement);
    expect(ref.current).toHaveClass("b4-refraction-sweep");
  });

  it("renders the WebGL crest canvas inside its own masked box", () => {
    const { container } = render(
      <RefractionSweep>
        <span>Card</span>
      </RefractionSweep>,
    );
    expect(container.querySelector(".b4-refraction-sweep__crest-mask")).toBeInTheDocument();
    const canvas = container.querySelector(".b4-refraction-sweep__crest");
    expect(canvas).toBeInTheDocument();
    expect(canvas?.tagName).toBe("CANVAS");
    expect(canvas).toHaveAttribute("aria-hidden", "true");
  });

  it("does not throw when WebGL2 is unavailable (e.g. under jsdom)", () => {
    // jsdom has no real WebGL2 implementation: HTMLCanvasElement.getContext
    // returns null here. The crest must degrade gracefully, not crash.
    expect(() =>
      render(
        <RefractionSweep>
          <span>Card</span>
        </RefractionSweep>,
      ),
    ).not.toThrow();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <RefractionSweep>
        <button type="button">Confirm</button>
      </RefractionSweep>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
