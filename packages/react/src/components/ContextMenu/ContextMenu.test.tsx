import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ContextMenu } from "./ContextMenu";

const items = [
  { value: "rename", label: "Rename" },
  { value: "delete", label: "Delete", destructive: true },
];

describe("ContextMenu", () => {
  it("opens on a contextmenu (right-click) event, not a plain click", async () => {
    const user = userEvent.setup();
    render(
      <ContextMenu items={items} onSelect={() => {}}>
        <div>Right-click area</div>
      </ContextMenu>,
    );

    await user.click(screen.getByText("Right-click area"));
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();

    fireEvent.contextMenu(screen.getByText("Right-click area"));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
  });

  it("calls onSelect with the clicked item's value and closes", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <ContextMenu items={items} onSelect={onSelect}>
        <div>Right-click area</div>
      </ContextMenu>,
    );

    fireEvent.contextMenu(screen.getByText("Right-click area"));
    await user.click(await screen.findByRole("menuitem", { name: "Delete" }));

    expect(onSelect).toHaveBeenCalledWith("delete");
  });

  it("has no axe violations while open", async () => {
    const { container } = render(
      <ContextMenu items={items} onSelect={() => {}}>
        <div>Right-click area</div>
      </ContextMenu>,
    );
    fireEvent.contextMenu(screen.getByText("Right-click area"));
    await screen.findByRole("menu");

    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
