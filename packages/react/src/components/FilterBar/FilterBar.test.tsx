import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { FilterBar, type ActiveFilter } from "./FilterBar";

const filters: ActiveFilter[] = [
  { id: "status", label: "Status: Active" },
  { id: "owner", label: "Owner: Ada" },
];

describe("FilterBar", () => {
  it("renders its filter controls", () => {
    render(
      <FilterBar>
        <input aria-label="Search" />
      </FilterBar>,
    );
    expect(screen.getByRole("textbox", { name: "Search" })).toBeInTheDocument();
  });

  it("renders no active-filter chips when none are applied", () => {
    render(<FilterBar>controls</FilterBar>);
    expect(screen.queryByRole("list", { name: "Active filters" })).toBeNull();
  });

  it("renders each active filter as a chip in a real list", () => {
    render(<FilterBar activeFilters={filters}>controls</FilterBar>);
    const list = screen.getByRole("list", { name: "Active filters" });
    expect(list).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
    expect(screen.getByText("Status: Active")).toBeInTheDocument();
  });

  it("removes a filter when its chip's remove button is clicked", async () => {
    const onRemoveFilter = vi.fn();
    const user = userEvent.setup();
    render(
      <FilterBar activeFilters={filters} onRemoveFilter={onRemoveFilter}>
        controls
      </FilterBar>,
    );

    await user.click(screen.getByRole("button", { name: "Remove filter: Status: Active" }));
    expect(onRemoveFilter).toHaveBeenCalledWith("status");
  });

  it("renders a Clear all action only when onClearAll is provided, and calls it", async () => {
    const onClearAll = vi.fn();
    const user = userEvent.setup();
    const { rerender } = render(<FilterBar activeFilters={filters}>controls</FilterBar>);
    expect(screen.queryByRole("button", { name: "Clear all" })).toBeNull();

    rerender(
      <FilterBar activeFilters={filters} onClearAll={onClearAll}>
        controls
      </FilterBar>,
    );
    await user.click(screen.getByRole("button", { name: "Clear all" }));
    expect(onClearAll).toHaveBeenCalledTimes(1);
  });

  it("has no axe violations", async () => {
    const { container } = render(
      <FilterBar activeFilters={filters} onClearAll={() => {}}>
        <input aria-label="Search" />
      </FilterBar>,
    );
    expect(await axe(container)).toHaveNoViolations();
  });
});
