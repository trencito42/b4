import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { axe } from "jest-axe";
import { KeyboardShortcut } from "./KeyboardShortcut";

describe("KeyboardShortcut", () => {
  it("renders one kbd element per key, in order", () => {
    render(<KeyboardShortcut keys={["Ctrl", "Shift", "P"]} />);
    const kbds = screen.getAllByText(/Ctrl|Shift|P/);
    expect(kbds.map((el) => el.textContent)).toEqual(["Ctrl", "Shift", "P"]);
    expect(kbds.every((el) => el.tagName === "KBD")).toBe(true);
  });

  it("has no axe violations", async () => {
    const { container } = render(<KeyboardShortcut keys={["⌘", "K"]} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
