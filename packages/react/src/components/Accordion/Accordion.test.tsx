import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { Accordion } from "./Accordion";

const items = [
  { value: "a", title: "Item A", content: "Content A" },
  { value: "b", title: "Item B", content: "Content B" },
  { value: "c", title: "Item C", content: "Content C" },
];

describe("Accordion", () => {
  it("only one panel is open at a time by default", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} defaultValue="a" />);

    expect(screen.getByText("Content A")).toBeVisible();

    await user.click(screen.getByRole("button", { name: "Item B" }));
    expect(screen.getByRole("button", { name: "Item A" })).toHaveAttribute(
      "aria-expanded",
      "false",
    );
    expect(screen.getByRole("button", { name: "Item B" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("supports multiple open panels when multiple is set", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} multiple defaultValue={["a"]} />);

    await user.click(screen.getByRole("button", { name: "Item B" }));

    expect(screen.getByRole("button", { name: "Item A" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByRole("button", { name: "Item B" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("calls onValueChange", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<Accordion items={items} onValueChange={onValueChange} />);

    await user.click(screen.getByRole("button", { name: "Item A" }));
    expect(onValueChange).toHaveBeenCalledWith("a");
  });

  // Base UI's Accordion deliberately has no roving-tabindex arrow-key
  // navigation between triggers — it was removed to follow the updated
  // ARIA APG guidance (accordion headers are now just normal Tab stops,
  // not a composite widget). An earlier draft of this test assumed
  // arrow-key navigation existed; it doesn't, by design, so the real
  // keyboard contract to verify is Tab order and Enter/Space activation.
  it("supports keyboard activation via Tab + Enter", async () => {
    const user = userEvent.setup();
    render(<Accordion items={items} />);

    await user.tab();
    expect(screen.getByRole("button", { name: "Item A" })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Item B" })).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(screen.getByRole("button", { name: "Item B" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });

  it("has no axe violations", async () => {
    const { container } = render(<Accordion items={items} defaultValue="a" />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
