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
  it("selects from the full option label, not only the radio circle", async () => {
    const user = userEvent.setup();
    render(<RadioGroup aria-label="Plan" items={items} defaultValue="free" />);
    await user.click(screen.getByText("Enterprise"));
    expect(screen.getByRole("radio", { name: "Enterprise" })).toBeChecked();
  });
  it("keeps the selected surface aligned with the controlled owner", async () => {
    const user = userEvent.setup();
    const change = vi.fn();
    const { container } = render(
      <RadioGroup aria-label="Plan" items={items} value="free" onValueChange={change} />,
    );
    await user.click(screen.getByRole("radio", { name: "Pro" }));
    expect(change).toHaveBeenCalledWith("pro");
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
    expect(container.querySelectorAll(".b4-radio-group__selection")).toHaveLength(1);
    expect(container.querySelector(".b4-radio-group__item--selected")).toHaveTextContent(
      "Free",
    );
  });

  it("does not accumulate selected surfaces under rapid changes", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <RadioGroup aria-label="Plan" items={items} defaultValue="free" />,
    );
    for (let i = 0; i < 6; i++)
      await user.click(
        screen.getByRole("radio", { name: i % 2 ? "Free" : "Enterprise" }),
      );
    expect(screen.getByRole("radio", { name: "Free" })).toBeChecked();
    expect(container.querySelectorAll(".b4-radio-group__selection")).toHaveLength(1);
  });
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
