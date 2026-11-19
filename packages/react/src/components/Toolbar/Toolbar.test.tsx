import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarButton, ToolbarIconButton } from "./Toolbar";

const Icon = (
  <svg viewBox="0 0 16 16" aria-hidden="true">
    <circle cx="8" cy="8" r="4" />
  </svg>
);

function Demo({ onBold, onPublish }: { onBold?: () => void; onPublish?: () => void }) {
  return (
    <Toolbar aria-label="Text formatting">
      <ToolbarGroup>
        <ToolbarIconButton aria-label="Bold" icon={Icon} onClick={onBold} />
        <ToolbarIconButton aria-label="Italic" icon={Icon} />
      </ToolbarGroup>
      <ToolbarSeparator />
      <ToolbarButton onClick={onPublish}>Publish</ToolbarButton>
    </Toolbar>
  );
}

describe("Toolbar", () => {
  it("renders as a real toolbar with its items", () => {
    render(<Demo />);
    expect(screen.getByRole("toolbar", { name: "Text formatting" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Bold" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Publish" })).toBeInTheDocument();
  });

  it("calls each item's onClick handler", async () => {
    const onBold = vi.fn();
    const onPublish = vi.fn();
    const user = userEvent.setup();
    render(<Demo onBold={onBold} onPublish={onPublish} />);

    await user.click(screen.getByRole("button", { name: "Bold" }));
    await user.click(screen.getByRole("button", { name: "Publish" }));

    expect(onBold).toHaveBeenCalledTimes(1);
    expect(onPublish).toHaveBeenCalledTimes(1);
  });

  it("moves focus between items with arrow keys (real roving tabindex, not just Tab order)", async () => {
    const user = userEvent.setup();
    render(<Demo />);

    const bold = screen.getByRole("button", { name: "Bold" });
    bold.focus();
    expect(bold).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Italic" })).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("button", { name: "Publish" })).toHaveFocus();
  });

  it("has no axe violations", async () => {
    const { container } = render(<Demo />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
