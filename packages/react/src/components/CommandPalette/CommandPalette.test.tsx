import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { CommandPalette } from "./CommandPalette";

const items = [
  { value: "new-file", label: "New file" },
  { value: "open-file", label: "Open file" },
  { value: "save", label: "Save", description: "Save the current file" },
];

describe("CommandPalette", () => {
  it("renders nothing when closed", () => {
    render(<CommandPalette aria-label="Commands" items={items} open={false} onOpenChange={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("shows the search input and item list when open", async () => {
    render(<CommandPalette aria-label="Commands" items={items} open onOpenChange={vi.fn()} onSelect={vi.fn()} />);
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "New file" })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: "Open file" })).toBeInTheDocument();
  });

  it("filters items as the query changes", async () => {
    const user = userEvent.setup();
    render(<CommandPalette aria-label="Commands" items={items} open onOpenChange={vi.fn()} onSelect={vi.fn()} />);

    await screen.findByRole("dialog");
    await user.type(screen.getByRole("combobox"), "save");

    expect(screen.getByRole("option", { name: /^Save/ })).toBeInTheDocument();
    expect(screen.queryByRole("option", { name: "New file" })).not.toBeInTheDocument();
  });

  it("calls onSelect with the chosen value and closes", async () => {
    const onSelect = vi.fn();
    const onOpenChange = vi.fn();
    const user = userEvent.setup();
    render(
      <CommandPalette aria-label="Commands" items={items} open onOpenChange={onOpenChange} onSelect={onSelect} />,
    );

    await screen.findByRole("dialog");
    await user.click(screen.getByRole("option", { name: "Open file" }));

    expect(onSelect).toHaveBeenCalledWith("open-file");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });

  it("shows the empty message when nothing matches", async () => {
    const user = userEvent.setup();
    render(<CommandPalette aria-label="Commands" items={items} open onOpenChange={vi.fn()} onSelect={vi.fn()} />);

    await screen.findByRole("dialog");
    await user.type(screen.getByRole("combobox"), "xyz-nonexistent");

    expect(screen.getByText("No matching commands")).toBeInTheDocument();
  });

  it("has no axe violations while open", async () => {
    const { container } = render(
      <CommandPalette aria-label="Commands" items={items} open onOpenChange={vi.fn()} onSelect={vi.fn()} />,
    );
    await screen.findByRole("dialog");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
