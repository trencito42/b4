import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable, type DataTableColumn, type DataTableSort } from "./DataTable";
import { StatusBadge } from "../StatusBadge/StatusBadge";

interface Project {
  id: string;
  name: string;
  owner: string;
  status: "online" | "offline" | "degraded" | "idle";
  updated: string;
}

const projects: Project[] = [
  { id: "1", name: "Marketing site", owner: "Ada Lovelace", status: "online", updated: "2026-11-18" },
  { id: "2", name: "Billing service", owner: "Grace Hopper", status: "degraded", updated: "2026-11-17" },
  { id: "3", name: "Internal CLI", owner: "Margaret Hamilton", status: "idle", updated: "2026-11-10" },
  { id: "4", name: "Mobile app", owner: "Katherine Johnson", status: "offline", updated: "2026-11-02" },
];

const columns: DataTableColumn<Project>[] = [
  { key: "name", header: "Project", sortable: true },
  { key: "owner", header: "Owner", sortable: true },
  { key: "status", header: "Status", render: (row) => <StatusBadge status={row.status}>{row.status}</StatusBadge> },
  { key: "updated", header: "Last updated", align: "end", sortable: true },
];

const meta: Meta<typeof DataTable<Project>> = {
  title: "Family D — Data & Content/DataTable",
  component: DataTable<Project>,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof DataTable<Project>>;

export const Default: Story = {
  render: () => {
    function Demo() {
      const [sort, setSort] = useState<DataTableSort>({ columnKey: "name", direction: "asc" });
      const sorted = [...projects].sort((a, b) => {
        const dir = sort.direction === "asc" ? 1 : -1;
        return String(a[sort.columnKey as keyof Project]).localeCompare(String(b[sort.columnKey as keyof Project])) * dir;
      });
      return (
        <DataTable
          caption="Projects"
          columns={columns}
          rows={sorted}
          getRowId={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
        />
      );
    }
    return <Demo />;
  },
};

export const WithSelection: Story = {
  render: () => {
    function Demo() {
      const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
      return (
        <DataTable
          caption="Projects"
          columns={columns}
          rows={projects}
          getRowId={(row) => row.id}
          getRowLabel={(row) => row.name}
          selectedIds={selectedIds}
          onSelectedIdsChange={setSelectedIds}
        />
      );
    }
    return <Demo />;
  },
};
