import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Tabs } from "./Tabs";

const items = [
  { value: "general", label: "General", content: "General content" },
  { value: "members", label: "Members", content: "Members content" },
  { value: "billing", label: "Billing", content: "Billing content" },
];

describe("Tabs", () => {
  it("shows the default tab's panel and hides the others", () => {
    render(<Tabs aria-label="Settings" items={items} defaultValue="general" />);
    expect(screen.getByText("General content")).toBeVisible();
    expect(screen.queryByText("Members content")).not.toBeInTheDocument();
  });

  it("switches panels on click and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tabs
        aria-label="Settings"
        items={items}
        defaultValue="general"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Members" }));
    expect(onValueChange).toHaveBeenCalledWith("members");
    expect(screen.getByText("Members content")).toBeVisible();
    expect(screen.queryByText("General content")).not.toBeInTheDocument();
  });

  it("supports arrow-key navigation between tabs (manual activation: arrows move focus, Enter activates)", async () => {
    const user = userEvent.setup();
    render(<Tabs aria-label="Settings" items={items} defaultValue="general" />);

    screen.getByRole("tab", { name: "General" }).focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Members" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByText("Members content")).toBeVisible();
  });

  it("is a controlled component when `value` is provided", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <Tabs
        aria-label="Settings"
        items={items}
        value="general"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("tab", { name: "Members" }));
    expect(onValueChange).toHaveBeenCalledWith("members");
    expect(screen.getByText("General content")).toBeVisible();
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <Tabs aria-label="Settings" items={items} defaultValue="general" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("renders with swipeable viewport enabled without breaking panel display", () => {
    render(<Tabs aria-label="Settings" items={items} defaultValue="general" swipeable />);
    expect(screen.getByText("General content")).toBeVisible();
    expect(screen.queryByText("Members content")).not.toBeInTheDocument();
  });
});
