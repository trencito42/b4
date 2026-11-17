import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SplitButton } from "./SplitButton";

const items = [
  { value: "preview", label: "Deploy preview" },
  { value: "rollback", label: "Rollback", destructive: true },
];

describe("SplitButton", () => {
  it("clicking the primary action calls onClick, not the menu", async () => {
    const onClick = vi.fn();
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SplitButton items={items} onSelect={onSelect} onClick={onClick}>Deploy</SplitButton>);

    await user.click(screen.getByRole("button", { name: "Deploy" }));
    expect(onClick).toHaveBeenCalledTimes(1);
    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.queryByRole("menu")).not.toBeInTheDocument();
  });

  it("the chevron button opens a real menu of secondary actions", async () => {
    const onSelect = vi.fn();
    const user = userEvent.setup();
    render(<SplitButton items={items} onSelect={onSelect}>Deploy</SplitButton>);

    await user.click(screen.getByRole("button", { name: "More Deploy options" }));
    await user.click(screen.getByRole("menuitem", { name: "Rollback" }));

    expect(onSelect).toHaveBeenCalledWith("rollback");
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SplitButton items={items} onSelect={() => {}}>
        Deploy
      </SplitButton>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
