import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ResizablePanels } from "./ResizablePanels";

describe("ResizablePanels", () => {
  it("renders both panels and a real separator", () => {
    render(
      <ResizablePanels aria-label="Resize panels">
        <div>Left</div>
        <div>Right</div>
      </ResizablePanels>,
    );
    expect(screen.getByText("Left")).toBeInTheDocument();
    expect(screen.getByText("Right")).toBeInTheDocument();
    expect(screen.getByRole("separator", { name: "Resize panels" })).toBeInTheDocument();
  });

  it("reports the initial split via aria-valuenow", () => {
    render(
      <ResizablePanels aria-label="Resize panels" defaultSplit={30}>
        <div>Left</div>
        <div>Right</div>
      </ResizablePanels>,
    );
    expect(screen.getByRole("separator")).toHaveAttribute("aria-valuenow", "30");
  });

  it("resizes with arrow keys, clamped to min/max", async () => {
    const user = userEvent.setup();
    render(
      <ResizablePanels aria-label="Resize panels" defaultSplit={50} minSplit={10} maxSplit={90}>
        <div>Left</div>
        <div>Right</div>
      </ResizablePanels>,
    );
    const separator = screen.getByRole("separator");
    separator.focus();

    await user.keyboard("{ArrowRight}");
    expect(separator).toHaveAttribute("aria-valuenow", "52");

    await user.keyboard("{ArrowLeft}{ArrowLeft}{ArrowLeft}");
    expect(separator).toHaveAttribute("aria-valuenow", "46");

    await user.keyboard("{Home}");
    expect(separator).toHaveAttribute("aria-valuenow", "10");

    await user.keyboard("{End}");
    expect(separator).toHaveAttribute("aria-valuenow", "90");
  });

  it("uses vertical arrow keys when orientation is vertical", async () => {
    const user = userEvent.setup();
    render(
      <ResizablePanels aria-label="Resize panels" orientation="vertical" defaultSplit={50}>
        <div>Top</div>
        <div>Bottom</div>
      </ResizablePanels>,
    );
    const separator = screen.getByRole("separator");
    separator.focus();

    await user.keyboard("{ArrowDown}");
    expect(separator).toHaveAttribute("aria-valuenow", "52");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
  });

  it("calls onSplitChange when resized", async () => {
    let lastSplit: number | undefined;
    const user = userEvent.setup();
    render(
      <ResizablePanels aria-label="Resize panels" defaultSplit={50} onSplitChange={(s) => (lastSplit = s)}>
        <div>Left</div>
        <div>Right</div>
      </ResizablePanels>,
    );
    screen.getByRole("separator").focus();
    await user.keyboard("{ArrowRight}");
    expect(lastSplit).toBe(52);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <ResizablePanels aria-label="Resize panels">
        <div>Left</div>
        <div>Right</div>
      </ResizablePanels>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
