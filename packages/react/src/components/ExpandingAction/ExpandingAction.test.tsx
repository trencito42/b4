import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { ExpandingAction } from "./ExpandingAction";

const PlusIcon = <svg viewBox="0 0 16 16" aria-hidden="true" />;

describe("ExpandingAction", () => {
  it("is labeled via aria-label at every width", () => {
    render(<ExpandingAction icon={PlusIcon} label="New item" />);
    expect(screen.getByRole("button", { name: "New item" })).toBeInTheDocument();
  });

  it("does not show the label text until hovered or focused", () => {
    render(<ExpandingAction icon={PlusIcon} label="New item" />);
    expect(screen.queryByText("New item")).not.toBeInTheDocument();
  });

  it("reveals the label text on focus", async () => {
    const user = userEvent.setup();
    render(<ExpandingAction icon={PlusIcon} label="New item" />);

    await user.tab();
    expect(screen.getByRole("button", { name: "New item" })).toHaveFocus();
    expect(screen.getByText("New item")).toBeInTheDocument();
  });

  // The AnimatePresence exit fade (waiting on onExitComplete before
  // unmounting) doesn't resolve synchronously with the blur event in
  // jsdom — `waitFor` lets its timer-driven animation actually finish
  // before asserting removal, rather than checking mid-animation state.
  it("mounts the label on focus and removes it again on blur", async () => {
    const user = userEvent.setup();
    render(
      <>
        <ExpandingAction icon={PlusIcon} label="New item" />
        <button type="button">Elsewhere</button>
      </>,
    );

    expect(screen.queryByText("New item")).not.toBeInTheDocument();
    await user.tab();
    expect(screen.getByText("New item")).toBeInTheDocument();
    await user.tab();
    await waitFor(() => expect(screen.queryByText("New item")).not.toBeInTheDocument());
  });

  it("fires onClick when clicked", async () => {
    const onClick = vi.fn();
    const user = userEvent.setup();
    render(<ExpandingAction icon={PlusIcon} label="New item" onClick={onClick} />);

    await user.click(screen.getByRole("button", { name: "New item" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("is disabled when requested", () => {
    render(<ExpandingAction icon={PlusIcon} label="New item" disabled />);
    expect(screen.getByRole("button", { name: "New item" })).toBeDisabled();
  });

  it("has no axe violations, collapsed or expanded", async () => {
    const user = userEvent.setup();
    const { container } = render(<ExpandingAction icon={PlusIcon} label="New item" />);
    expect(await axe(container)).toHaveNoViolations();

    await user.tab();
    expect(await axe(container)).toHaveNoViolations();
  });
});
