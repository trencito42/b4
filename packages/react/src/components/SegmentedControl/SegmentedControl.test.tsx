import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SegmentedControl } from "./SegmentedControl";

const items = [
  { value: "changelog", label: "Changelog" },
  { value: "login", label: "Login" },
] as const;

describe("SegmentedControl", () => {
  it("renders all items with the default value selected", () => {
    render(
      <SegmentedControl aria-label="Page" items={items} defaultValue="changelog" />,
    );
    expect(screen.getByRole("button", { name: "Changelog" })).toHaveAttribute(
      "data-pressed",
    );
    expect(screen.getByRole("button", { name: "Login" })).not.toHaveAttribute(
      "data-pressed",
    );
  });

  it("moves selection on click and calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SegmentedControl
        aria-label="Page"
        items={items}
        defaultValue="changelog"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(onValueChange).toHaveBeenCalledWith("login");
    expect(screen.getByRole("button", { name: "Login" })).toHaveAttribute(
      "data-pressed",
    );
  });

  it("supports arrow-key keyboard navigation between segments", async () => {
    const user = userEvent.setup();
    render(
      <SegmentedControl aria-label="Page" items={items} defaultValue="changelog" />,
    );

    screen.getByRole("button", { name: "Changelog" }).focus();
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("button", { name: "Login" })).toHaveFocus();
  });

  it("keeps exactly one indicator element, never zero or duplicated, under rapid repeated clicks", async () => {
    const user = userEvent.setup();
    const { container } = render(
      <SegmentedControl aria-label="Page" items={items} defaultValue="changelog" />,
    );

    const changelog = screen.getByRole("button", { name: "Changelog" });
    const login = screen.getByRole("button", { name: "Login" });

    for (let i = 0; i < 8; i++) {
      await user.click(i % 2 === 0 ? login : changelog);
    }

    expect(
      container.querySelectorAll(".b4-segmented-control__indicator"),
    ).toHaveLength(1);
  });

  it("is a controlled component when `value` is provided", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(
      <SegmentedControl
        aria-label="Page"
        items={items}
        value="changelog"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Login" }));

    expect(onValueChange).toHaveBeenCalledWith("login");
    // value prop didn't change, so the rendered selection shouldn't move.
    expect(screen.getByRole("button", { name: "Changelog" })).toHaveAttribute(
      "data-pressed",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <SegmentedControl aria-label="Page" items={items} defaultValue="changelog" />,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });

  it("exposes data-b4-segment-value on segment items for pointer hit-testing", () => {
    render(
      <SegmentedControl aria-label="Page" items={items} defaultValue="changelog" />,
    );
    expect(screen.getByRole("button", { name: "Changelog" })).toHaveAttribute(
      "data-b4-segment-value",
      "changelog",
    );
    expect(screen.getByRole("button", { name: "Login" })).toHaveAttribute(
      "data-b4-segment-value",
      "login",
    );
  });
});
