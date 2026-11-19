import { describe, expect, it, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
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

  it("commits the segment the pointer actually landed on", async () => {
    // jsdom has no layout, so every element's rect is a 0×0 dot at the
    // origin and a plain `user.click` always reports the pointer at (0,0).
    // That makes the pointer hit-testing resolve to the *first* segment
    // whatever the user clicked, which hides a whole class of bugs. Give the
    // segments real rects and press at a point that is unambiguously inside
    // the second one.
    const onValueChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="Page"
        items={items}
        defaultValue="changelog"
        onValueChange={onValueChange}
      />,
    );

    const changelog = screen.getByRole("button", { name: "Changelog" });
    const login = screen.getByRole("button", { name: "Login" });

    const rect = (left: number): DOMRect =>
      ({
        left,
        right: left + 50,
        top: 0,
        bottom: 20,
        width: 50,
        height: 20,
        x: left,
        y: 0,
        toJSON: () => ({}),
      }) as DOMRect;

    changelog.getBoundingClientRect = () => rect(0);
    login.getBoundingClientRect = () => rect(50);

    fireEvent.pointerDown(login, {
      pointerId: 1,
      button: 0,
      clientX: 75,
      clientY: 10,
    });
    fireEvent.pointerUp(login, {
      pointerId: 1,
      button: 0,
      clientX: 75,
      clientY: 10,
    });
    fireEvent.click(login);

    // Exactly one commit, for the segment the pointer was on.
    expect(onValueChange).toHaveBeenCalledTimes(1);
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
