import { describe, expect, it } from "vitest";
import { render, screen, fireEvent, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe } from "jest-axe";
import { DataGrid, type DataGridColumn } from "./DataGrid";

interface Row {
  id: string;
  name: string;
  value: number;
}

const manyRows: Row[] = Array.from({ length: 200 }, (_, i) => ({
  id: String(i),
  name: `Item ${i}`,
  value: i,
}));

const fewRows: Row[] = [
  { id: "a", name: "Banana", value: 2 },
  { id: "b", name: "Apple", value: 1 },
  { id: "c", name: "Cherry", value: 3 },
];

const manyColumns: DataGridColumn<Row>[] = [
  { key: "name", header: "Name", getValue: (r) => r.name },
  { key: "value", header: "Value", getValue: (r) => r.value, align: "end" },
];

describe("DataGrid", () => {
  it("renders a real ARIA grid with column headers and the caption", () => {
    render(<DataGrid caption="Items" columns={manyColumns} rows={fewRows} getRowId={(r) => r.id} />);
    expect(screen.getByRole("grid", { name: "Items" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Name" })).toBeInTheDocument();
    expect(screen.getByRole("columnheader", { name: "Value" })).toBeInTheDocument();
  });

  it("virtualizes: with 200 rows and the default viewport, far fewer than 200 row elements exist in the DOM", () => {
    render(<DataGrid caption="Items" columns={manyColumns} rows={manyRows} getRowId={(r) => r.id} />);
    // height=360 / rowHeight=40 + overscan*2(8) = 17 rows expected, generously bounded at 40.
    const rendered = screen.getAllByRole("row").filter((el) => el.getAttribute("aria-rowindex") !== "1");
    expect(rendered.length).toBeGreaterThan(0);
    expect(rendered.length).toBeLessThan(40);
    expect(screen.queryByText("Item 199")).toBeNull();
  });

  it("renders different rows after scrolling the viewport", () => {
    render(<DataGrid caption="Items" columns={manyColumns} rows={manyRows} getRowId={(r) => r.id} />);
    expect(screen.getByText("Item 0")).toBeInTheDocument();

    fireEvent.scroll(screen.getByRole("grid"), { target: { scrollTop: 4000 } });

    expect(screen.queryByText("Item 0")).toBeNull();
    expect(screen.getByText("Item 100")).toBeInTheDocument();
  });

  it("resets scroll to the top when sorting, so the view doesn't silently stay stuck mid-list", async () => {
    const user = userEvent.setup();
    render(<DataGrid caption="Items" columns={manyColumns} rows={manyRows} getRowId={(r) => r.id} />);

    const grid = screen.getByRole("grid");
    fireEvent.scroll(grid, { target: { scrollTop: 4000 } });
    expect(screen.getByText("Item 100")).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Name" }));

    expect(grid.scrollTop).toBe(0);
    expect(screen.getByText("Item 0")).toBeInTheDocument();
  });

  it("sorts rows when a column header is clicked, toggling direction on repeat clicks", async () => {
    const user = userEvent.setup();
    render(<DataGrid caption="Items" columns={manyColumns} rows={fewRows} getRowId={(r) => r.id} />);

    const firstRowName = () => within(screen.getAllByRole("row")[1]!).getByText(/Apple|Banana|Cherry/);

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(firstRowName()).toHaveTextContent("Apple");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "ascending");

    await user.click(screen.getByRole("button", { name: "Name" }));
    expect(firstRowName()).toHaveTextContent("Cherry");
    expect(screen.getByRole("columnheader", { name: "Name" })).toHaveAttribute("aria-sort", "descending");
  });

  it("sorts numeric columns numerically, not lexicographically", async () => {
    const numericRows: Row[] = [
      { id: "a", name: "A", value: 2 },
      { id: "b", name: "B", value: 10 },
      { id: "c", name: "C", value: 1 },
    ];
    const user = userEvent.setup();
    render(<DataGrid caption="Items" columns={manyColumns} rows={numericRows} getRowId={(r) => r.id} />);

    await user.click(screen.getByRole("button", { name: "Value" }));
    const rows = screen.getAllByRole("row").slice(1);
    expect(within(rows[0]!).getByText("1")).toBeInTheDocument();
    expect(within(rows[1]!).getByText("2")).toBeInTheDocument();
    expect(within(rows[2]!).getByText("10")).toBeInTheDocument();
  });

  it("filters rows by the quick-filter text across all columns", async () => {
    const user = userEvent.setup();
    render(<DataGrid caption="Items" columns={manyColumns} rows={fewRows} getRowId={(r) => r.id} filterLabel="Filter items" />);

    await user.type(screen.getByRole("searchbox", { name: "Filter items" }), "apple");

    expect(screen.getByText("Apple")).toBeInTheDocument();
    expect(screen.queryByText("Banana")).toBeNull();
    expect(screen.queryByText("Cherry")).toBeNull();
  });

  it("shows an empty state when no rows match the filter", async () => {
    const user = userEvent.setup();
    render(<DataGrid caption="Items" columns={manyColumns} rows={fewRows} getRowId={(r) => r.id} filterLabel="Filter items" />);

    await user.type(screen.getByRole("searchbox", { name: "Filter items" }), "nonexistent");

    expect(screen.getByText("No matching rows")).toBeInTheDocument();
    expect(screen.queryByRole("gridcell")).toBeNull();
  });

  it("has no axe violations", async () => {
    const { container } = render(<DataGrid caption="Items" columns={manyColumns} rows={fewRows} getRowId={(r) => r.id} />);
    expect(await axe(container)).toHaveNoViolations();
  });
});
