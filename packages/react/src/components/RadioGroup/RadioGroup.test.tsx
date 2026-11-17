import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { RadioGroup } from "./RadioGroup";

const items = [
  { value: "free", label: "Free" },
  { value: "pro", label: "Pro" },
  { value: "enterprise", label: "Enterprise" },
] as const;

describe("RadioGroup", () => {
  it("selects the default value", () => {
    render(<RadioGroup aria-label="Plan" items={items} defaultValue="pro" />);
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Free" })).not.toBeChecked();
  });

  it("moves selection on click and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <RadioGroup
        aria-label="Plan"
        items={items}
        defaultValue="free"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "Enterprise" }));
    expect(onValueChange).toHaveBeenCalledWith("enterprise");
    expect(screen.getByRole("radio", { name: "Enterprise" })).toBeChecked();
  });

  it("supports arrow-key navigation between options", async () => {
    const user = userEvent.setup();
    render(<RadioGroup aria-label="Plan" items={items} defaultValue="free" />);

    screen.getByRole("radio", { name: "Free" }).focus();
    await user.keyboard("{ArrowDown}");

    expect(screen.getByRole("radio", { name: "Pro" })).toHaveFocus();
    expect(screen.getByRole("radio", { name: "Pro" })).toBeChecked();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <RadioGroup aria-label="Plan" items={items} defaultValue="free" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
