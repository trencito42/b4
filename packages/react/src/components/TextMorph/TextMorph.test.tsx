import { render, screen, act } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { axe } from "jest-axe";
import { TextMorph } from "./TextMorph.js";

describe("TextMorph Component", () => {
  it("renders the text and exposes accessible name for screen readers", () => {
    render(<TextMorph value="Server deployed" />);
    const el = screen.getByLabelText("Server deployed");
    expect(el).toBeInTheDocument();
    expect(el).toHaveClass("b4-text-morph");

    // The screen-reader span should contain the full text
    const srOnly = el.querySelector(".b4-text-morph__sr-only");
    expect(srOnly).toHaveTextContent("Server deployed");

    // Visual tokens have aria-hidden="true"
    const tokens = el.querySelectorAll(".b4-text-morph__token");
    expect(tokens.length).toBeGreaterThan(0);
    tokens.forEach((t) => {
      expect(t).toHaveAttribute("aria-hidden", "true");
    });
  });

  it("updates visual tokens when value changes", () => {
    const { rerender } = render(<TextMorph value="Write report" mode="words" />);
    expect(screen.getByLabelText("Write report")).toBeInTheDocument();

    act(() => {
      rerender(<TextMorph value="Review report" mode="words" />);
    });

    expect(screen.getByLabelText("Review report")).toBeInTheDocument();
    const srOnly = document.querySelector(".b4-text-morph__sr-only");
    expect(srOnly).toHaveTextContent("Review report");
  });

  it("supports character mode for fine-grained grapheme changes", () => {
    const { rerender } = render(<TextMorph value="Save" mode="characters" />);
    expect(screen.getByLabelText("Save")).toBeInTheDocument();

    act(() => {
      rerender(<TextMorph value="Saved" mode="characters" />);
    });

    expect(screen.getByLabelText("Saved")).toBeInTheDocument();
  });

  it("supports numeric place-value mode", () => {
    const { rerender } = render(<TextMorph value="$1204" mode="numbers" />);
    expect(screen.getByLabelText("$1204")).toBeInTheDocument();

    act(() => {
      rerender(<TextMorph value="$1318" mode="numbers" />);
    });

    expect(screen.getByLabelText("$1318")).toBeInTheDocument();
  });

  it("renders with custom as tag (e.g. h2)", () => {
    render(<TextMorph value="Title header" as="h2" />);
    const heading = screen.getByRole("heading", { level: 2 });
    expect(heading).toBeInTheDocument();
    expect(heading).toHaveClass("b4-text-morph");
  });

  it("has no axe accessibility violations", async () => {
    const { container } = render(
      <div>
        <TextMorph value="Active users: 1,420" />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
