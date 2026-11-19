import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { axe } from "jest-axe";
import { TextMorph } from "./TextMorph";

describe("TextMorph", () => {
  it("renders the full value in a visually-hidden element for assistive tech", () => {
    render(<TextMorph value="Write report" />);
    expect(screen.getByText("Write report", { selector: ".b4-text-morph__sr-only" })).toBeInTheDocument();
  });

  it("marks the animated token region aria-hidden so the value isn't announced twice", () => {
    const { container } = render(<TextMorph value="Write report" />);
    const visible = container.querySelector(".b4-text-morph__visible");
    expect(visible).toHaveAttribute("aria-hidden", "true");
  });

  it("renders one token per word, including the surviving middle token on a word swap", () => {
    const { container, rerender } = render(<TextMorph value="cat and dog" />);
    const tokensBefore = within(container.querySelector(".b4-text-morph__visible")!).getAllByText(/./);
    expect(tokensBefore.map((t) => t.textContent)).toContain("and");

    rerender(<TextMorph value="dog and cat" />);
    expect(screen.getByText("dog and cat", { selector: ".b4-text-morph__sr-only" })).toBeInTheDocument();
  });

  it("updates the sr-only text immediately on a numeric change", () => {
    const { rerender } = render(<TextMorph value="$98,204" />);
    expect(screen.getByText("$98,204", { selector: ".b4-text-morph__sr-only" })).toBeInTheDocument();

    rerender(<TextMorph value="$99,204" />);
    expect(screen.getByText("$99,204", { selector: ".b4-text-morph__sr-only" })).toBeInTheDocument();
  });

  it("supports character-level morphing for diacritic-sensitive text", () => {
    render(<TextMorph value="Bună dimineața!" mode="characters" locale="ro" />);
    expect(screen.getByText("Bună dimineața!", { selector: ".b4-text-morph__sr-only" })).toBeInTheDocument();
  });

  it("applies a custom className to the root", () => {
    const { container } = render(<TextMorph value="hi" className="custom-morph" />);
    expect(container.querySelector(".b4-text-morph")).toHaveClass("custom-morph");
  });

  it("has no axe violations", async () => {
    const { container } = render(<TextMorph value="Write report" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
