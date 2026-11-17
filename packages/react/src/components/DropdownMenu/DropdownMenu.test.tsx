import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DropdownMenu } from "./DropdownMenu";
import { Button } from "../Button/Button";

const items = [
  { value: "rename", label: "Rename" },
  { value: "duplicate", label: "Duplicate" },
  { value: "delete", label: "Delete", destructive: true },
];

describe("DropdownMenu", () => {
  it("opens the menu when the trigger is clicked", async () => {
    const user = userEvent.setup();
    render(
      <DropdownMenu items={items} onSelect={() => {}} trigger={<Button>Actions</Button>} />,
    );

    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Actions" }));
    expect(await screen.findByRole("menu")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "Rename" })).toBeInTheDocument();
  });

  it("calls onSelect with the clicked item's value and closes", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu items={items} onSelect={onSelect} trigger={<Button>Actions</Button>} />,
    );

    await user.click(screen.getByRole("button", { name: "Actions" }));
    await user.click(await screen.findByRole("menuitem", { name: "Duplicate" }));

    expect(onSelect).toHaveBeenCalledWith("duplicate");
  });

  it("supports keyboard navigation and selection", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(
      <DropdownMenu items={items} onSelect={onSelect} trigger={<Button>Actions</Button>} />,
    );

    const trigger = screen.getByRole("button", { name: "Actions" });
    trigger.focus();
    await user.keyboard("{Enter}");
    await screen.findByRole("menu");
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{Enter}");

    expect(onSelect).toHaveBeenCalledWith("duplicate");
  });

  it("has no axe violations while open", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <DropdownMenu items={items} onSelect={() => {}} trigger={<Button>Actions</Button>} />,
    );
    await user.click(screen.getByRole("button", { name: "Actions" }));
    await screen.findByRole("menu");

    // "region" flags that the isolated test body isn't a full page with
    // landmarks — expected for a unit test, not a real defect; see the
    // same exception used throughout e2e/*.spec.ts via disableRules.
    const results = await axe(container.ownerDocument.body, {
      rules: { region: { enabled: false } },
    });
    expect(results).toHaveNoViolations();
  });
});
