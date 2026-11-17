import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { SearchField } from "./SearchField";

describe("SearchField", () => {
  it("disables the clear action and preserves disabled contents", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search" disabled defaultValue="saved query" />);
    const clear = screen.getByRole("button", { name: "Clear search" });
    expect(clear).toBeDisabled();
    await user.click(clear);
    expect(screen.getByRole("searchbox")).toHaveValue("saved query");
  });

  it("returns focus to the search input after clearing", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search" defaultValue="query" />);
    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(screen.getByRole("searchbox")).toHaveFocus();
  });
  it("has no clear button when empty", () => {
    render(<SearchField label="Search" />);
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("shows a clear button once there is a value, and clears it on click", async () => {
    const user = userEvent.setup();
    render(<SearchField label="Search" defaultValue="button" />);

    const clear = screen.getByRole("button", { name: "Clear search" });
    await user.click(clear);

    expect(screen.getByRole("searchbox", { name: "Search" })).toHaveValue("");
    expect(
      screen.queryByRole("button", { name: "Clear search" }),
    ).not.toBeInTheDocument();
  });

  it("calls onValueChange as the user types and when cleared", async () => {
    const onValueChange = vi.fn();
    const user = userEvent.setup();
    render(<SearchField label="Search" onValueChange={onValueChange} />);

    await user.type(screen.getByRole("searchbox", { name: "Search" }), "a");
    expect(onValueChange).toHaveBeenLastCalledWith("a");

    await user.click(screen.getByRole("button", { name: "Clear search" }));
    expect(onValueChange).toHaveBeenLastCalledWith("");
  });

  it("has no axe violations, empty or with a value", async () => {
    const { container } = render(
      <div>
        <SearchField label="Empty" />
        <SearchField label="With value" defaultValue="button" />
        <SearchField label="Disabled" disabled />
      </div>,
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
