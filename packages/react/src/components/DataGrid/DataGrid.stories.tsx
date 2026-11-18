import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataGrid, type DataGridColumn } from "./DataGrid";

interface Item {
  id: string;
  name: string;
  category: string;
  price: number;
}

const categories = ["Hardware", "Software", "Services", "Supplies"];

const items: Item[] = Array.from({ length: 500 }, (_, i) => ({
  id: String(i),
  name: `Item ${i + 1}`,
  category: categories[i % categories.length]!,
  price: Math.round((Math.sin(i) * 500 + 500) * 100) / 100,
}));

const columns: DataGridColumn<Item>[] = [
  { key: "name", header: "Name", getValue: (row) => row.name },
  { key: "category", header: "Category", getValue: (row) => row.category },
  {
    key: "price",
    header: "Price",
    getValue: (row) => row.price,
    align: "end",
    render: (row) => `$${row.price.toFixed(2)}`,
  },
];

const meta: Meta<typeof DataGrid<Item>> = {
  title: "Family D — Data & Content/DataGrid",
  component: DataGrid<Item>,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataGrid<Item>>;

export const Default: Story = {
  args: {
    caption: `${items.length} items`,
    columns,
    rows: items,
    getRowId: (row) => row.id,
  },
};
