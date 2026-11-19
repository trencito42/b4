import { describe, expect, it, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { BorderBeam } from "./BorderBeam";

vi.mock("@b4/motion", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@b4/motion")>();
  return { ...actual, useReducedMotion: vi.fn(() => false) };
});

import { useReducedMotion } from "@b4/motion";

describe("BorderBeam", () => {
  afterEach(() => {
    vi.mocked(useReducedMotion).mockReturnValue(false);
  });

  it("renders its children unchanged", () => {
    render(
      <BorderBeam>
        <button type="button">Confirm</button>
      </BorderBeam>,
    );
    expect(screen.getByRole("button", { name: "Confirm" })).toBeInTheDocument();
  });

  it("renders the beam ring as aria-hidden, so it's invisible to assistive tech", () => {
    const { container } = render(
      <BorderBeam>
        <span>Card</span>
      </BorderBeam>,
    );
    const ring = container.querySelector(".b4-border-beam__ring");
    expect(ring).toHaveAttribute("aria-hidden", "true");
  });

  it("renders no ring at all when inactive", () => {
    const { container } = render(
      <BorderBeam active={false}>
        <span>Card</span>
      </BorderBeam>,
    );
    expect(container.querySelector(".b4-border-beam__ring")).toBeNull();
  });

  it("applies the requested size, tone and duration as CSS custom properties", () => {
    const { container } = render(
      <BorderBeam size="lg" tone="danger" duration={3}>
        <span>Card</span>
      </BorderBeam>,
    );
    const ring = container.querySelector(".b4-border-beam__ring") as HTMLElement;
    expect(ring.style.getPropertyValue("--b4-border-beam-clip")).toBe("13px");
    expect(ring.style.getPropertyValue("--b4-border-beam-blur")).toBe("6px");
    expect(ring.style.getPropertyValue("--b4-border-beam-color")).toBe("var(--b4-danger-text)");
    expect(ring.style.getPropertyValue("--b4-border-beam-duration")).toBe("3s");
  });

  it("does not add the spinning class under reduced motion", () => {
    vi.mocked(useReducedMotion).mockReturnValue(true);
    const { container } = render(
      <BorderBeam>
        <span>Card</span>
      </BorderBeam>,
    );
    const ring = container.querySelector(".b4-border-beam__ring");
    expect(ring).not.toHaveClass("b4-border-beam__ring--spinning");
  });

  it("adds the spinning class when active and motion is allowed", () => {
    const { container } = render(
      <BorderBeam>
        <span>Card</span>
      </BorderBeam>,
    );
    const ring = container.querySelector(".b4-border-beam__ring");
    expect(ring).toHaveClass("b4-border-beam__ring--spinning");
  });

  it("renders a travelling spark and a counter-rotating wake layer", () => {
    const { container } = render(
      <BorderBeam size="md">
        <span>Card</span>
      </BorderBeam>,
    );
    expect(container.querySelector(".b4-border-beam__spark")).toBeInTheDocument();
    expect(container.querySelector(".b4-border-beam__gradient--wake")).toBeInTheDocument();
    const ring = container.querySelector(".b4-border-beam__ring") as HTMLElement;
    expect(ring.style.getPropertyValue("--b4-border-beam-spark-size")).toBe("7px");
  });

  it("renders a soft ambient halo behind the card, blended from tokens in aurora mode", () => {
    const { container, rerender } = render(
      <BorderBeam tone="success">
        <span>Card</span>
      </BorderBeam>,
    );
    const halo = container.querySelector(".b4-border-beam__halo");
    expect(halo).toBeInTheDocument();
    expect(halo).not.toHaveClass("b4-border-beam__halo--aurora");

    rerender(
      <BorderBeam tone="aurora">
        <span>Card</span>
      </BorderBeam>,
    );
    expect(container.querySelector(".b4-border-beam__halo")).toHaveClass("b4-border-beam__halo--aurora");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <BorderBeam>
        <button type="button">Confirm</button>
      </BorderBeam>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
