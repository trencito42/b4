import {
  Avatar,
  Badge,
  DataTable,
  StatusBadge,
  type DataTableColumn,
  type DataTableSort,
} from "@b4/react";
import { severityMeta, statusMeta, type Incident } from "./data.js";

export interface IncidentsTableProps {
  rows: Incident[];
  sort: DataTableSort;
  onSortChange: (sort: DataTableSort) => void;
  selectedIds: Set<string>;
  onSelectedIdsChange: (ids: Set<string>) => void;
  activeIncidentId: string;
  onActivateIncident: (incident: Incident) => void;
}

/**
 * The incident queue. Sorting is fully controlled — `DataTable` reports the
 * requested sort and the consumer decides the order, because severity is an
 * ordinal (SEV-1 is more urgent than SEV-4) and not a string.
 */
export function IncidentsTable({
  rows,
  sort,
  onSortChange,
  selectedIds,
  onSelectedIdsChange,
  activeIncidentId,
  onActivateIncident,
}: IncidentsTableProps) {
  const columns: DataTableColumn<Incident>[] = [
    {
      key: "id",
      header: "Incident",
      sortable: true,
      render: (row) => (
        <button
          type="button"
          className="ops-incident-ref"
          aria-current={row.id === activeIncidentId ? "true" : undefined}
          onClick={() => onActivateIncident(row)}
        >
          {row.id}
        </button>
      ),
    },
    {
      key: "title",
      header: "Summary",
      sortable: true,
      render: (row) => (
        <span className="ops-incident-title" title={row.title}>
          {row.title}
        </span>
      ),
    },
    {
      key: "severity",
      header: "Severity",
      sortable: true,
      render: (row) => (
        <Badge tone={severityMeta[row.severity].tone}>{severityMeta[row.severity].label}</Badge>
      ),
    },
    {
      key: "status",
      header: "Status",
      render: (row) => (
        <StatusBadge status={statusMeta[row.status].badge}>{statusMeta[row.status].label}</StatusBadge>
      ),
    },
    {
      key: "owner",
      header: "Owner",
      render: (row) => (
        <span className="ops-owner">
          <Avatar name={row.owner.name} size="sm" />
          <span>{row.owner.name}</span>
        </span>
      ),
    },
  ];

  return (
    <DataTable<Incident>
      className="ops-table"
      caption="Live incident queue for Northwind Supply production services."
      hideCaption
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      getRowLabel={(row) => `${row.id} ${row.title}`}
      sort={sort}
      onSortChange={onSortChange}
      selectedIds={selectedIds}
      onSelectedIdsChange={onSelectedIdsChange}
    />
  );
}
