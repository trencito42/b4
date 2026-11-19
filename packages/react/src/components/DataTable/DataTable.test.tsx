import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DataTable, type DataTableColumn, type DataTableSort } from "./DataTable";

interface Row {
  id: string;
  name: string;
  value: number;
}

const rows: Row[] = [
  { id: "a", name: "Alpha", value: 10 },
  { id: "b", name: "Beta", value: 20 },
];

const columns: DataTableColumn<Row>[] = [
  { key: "name", header: "Name", sortable: true },
  { key: "value", header: "Value", align: "end" },
];

describe("DataTable", () => {
  it("renders a real table with a caption, column headers and rows", () => {
    render(<DataTable caption="Items" columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.getByRole("table", { name: "Items" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByText("Alpha")).toBeInTheDocument();
    expect(screen.getByText("Beta")).toBeInTheDocument();
  });

  it("hides the caption visually, but not from assistive tech, when hideCaption is set", () => {
    const { container } = render(
      <DataTable caption="Items" columns={columns} rows={rows} getRowId={(r) => r.id} hideCaption />,
    );
    expect(screen.getByRole("table", { name: "Items" })).toBeInTheDocument();
    expect(container.querySelector(".b4-data-table__caption--hidden")).not.toBeNull();
  });

  it("reports a toggled sort direction when a sortable header is clicked", async () => {
    const onSortChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable
        caption="Items"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        sort={{ columnKey: "name", direction: "asc" }}
        onSortChange={onSortChange}
      />,
    );

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(onSortChange).toHaveBeenCalledWith({ columnKey: "name", direction: "desc" });
  });

  it("marks the sorted column's header with the correct aria-sort", () => {
    const sort: DataTableSort = { columnKey: "name", direction: "desc" };
    render(
      <DataTable caption="Items" columns={columns} rows={rows} getRowId={(r) => r.id} sort={sort} onSortChange={() => {}} />,
    );
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "descending");
    expect(screen.getByRole("columnheader", { name: "Value" })).not.toHaveAttribute("aria-sort");
  });

  it("does not render selection checkboxes when selection isn't wired up", () => {
    render(<DataTable caption="Items" columns={columns} rows={rows} getRowId={(r) => r.id} />);
    expect(screen.queryByRole("checkbox")).toBeNull();
  });

  it("selects an individual row and reports the updated id set", async () => {
    const onSelectedIdsChange = vi.fn();
    const user = userEvent.setup();
    render(
      <DataTable
        caption="Items"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        selectedIds={new Set()}
        onSelectedIdsChange={onSelectedIdsChange}
      />,
    );

    await user.click(screen.getByRole("checkbox", { name: "Select Alpha" }));
    expect(onSelectedIdsChange).toHaveBeenCalledWith(new Set(["a"]));
  });

  it("selects all rows via the header checkbox, and shows indeterminate when only some are selected", () => {
    const { rerender } = render(
      <DataTable
        caption="Items"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        selectedIds={new Set(["a"])}
        onSelectedIdsChange={() => {}}
      />,
    );
    const selectAll = screen.getByRole("checkbox", { name: "Select all rows" });
    expect(selectAll).toHaveAttribute("data-indeterminate");

    rerender(
      <DataTable
        caption="Items"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        selectedIds={new Set(["a", "b"])}
        onSelectedIdsChange={() => {}}
      />,
    );
    expect(screen.getByRole("checkbox", { name: "Select all rows" })).toBeChecked();
  });

  it("has no axe violations with sorting and selection both wired up", async () => {
    const { container } = render(
      <DataTable
        caption="Items"
        columns={columns}
        rows={rows}
        getRowId={(r) => r.id}
        getRowLabel={(r) => r.name}
        sort={{ columnKey: "name", direction: "asc" }}
        onSortChange={() => {}}
        selectedIds={new Set(["a"])}
        onSelectedIdsChange={() => {}}
      />,
    );
    expect(await axe(container)).toHaveNoViolations();
  });

  it("preserves selections on other pages when toggling visible rows", async () => {
    const onSelectedIdsChange = vi.fn();
    const user = userEvent.setup();
    const props = { caption: "Items", columns, rows, getRowId: (row: Row) => row.id, onSelectedIdsChange };
    const { rerender } = render(<DataTable {...props} selectedIds={new Set(["other-page"])} />);
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(new Set(["other-page", "a", "b"]));
    rerender(<DataTable {...props} selectedIds={new Set(["other-page", "a", "b"])} />);
    await user.click(screen.getByRole("checkbox", { name: "Select all rows" }));
    expect(onSelectedIdsChange).toHaveBeenLastCalledWith(new Set(["other-page"]));
  });
});
