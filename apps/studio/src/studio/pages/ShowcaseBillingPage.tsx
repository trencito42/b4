import { useMemo, useState } from "react";
import { Badge, DataTable, InlineAlert, PageHeader, Pagination, type DataTableSort } from "@b4/react";
import { invoiceRows } from "../sampleData.js";
import type { StudioPreviewWidth } from "../settings.js";

type InvoiceRow = (typeof invoiceRows)[number];

export function ShowcaseBillingPage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | undefined>();

  const frameClass =
    previewWidth === "390"
      ? "b4-studio__preview-frame--390"
      : previewWidth === "768"
        ? "b4-studio__preview-frame--768"
        : previewWidth === "1440"
          ? "b4-studio__preview-frame--1440"
          : "";

  const sortedRows = useMemo(() => {
    const copy = [...invoiceRows];
    if (!sort) return copy;
    copy.sort((a, b) => {
      const av = sortKey(a, sort.columnKey);
      const bv = sortKey(b, sort.columnKey);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [sort]);

  const pageSize = 3;
  const pageRows = sortedRows.slice((page - 1) * pageSize, page * pageSize);

  return (
    <div className={["b4-studio__preview-frame", frameClass].filter(Boolean).join(" ")}>
      <PageHeader title="Billing" description="Invoices and subscription posture — sample data only." />
      <div style={{ marginTop: "var(--b4-space-8)", display: "flex", flexDirection: "column", gap: "var(--b4-space-8)" }}>
        <InlineAlert tone="warning" title="Sample workspace">
          Figures below are illustrative. This is not a connected billing backend.
        </InlineAlert>
        <DataTable<InvoiceRow>
          caption="Recent invoices"
          columns={[
            { key: "customer", header: "Customer", sortable: true },
            { key: "plan", header: "Plan", sortable: true },
            {
              key: "amount",
              header: "Amount",
              sortable: true,
              align: "end",
              render: (row) => `$${row.amount.toLocaleString()}`,
            },
            {
              key: "status",
              header: "Status",
              render: (row) => <Badge tone={statusTone(row.status)}>{row.status}</Badge>,
            },
          ]}
          rows={pageRows}
          getRowId={(row) => row.id}
          sort={sort}
          onSortChange={setSort}
        />
        <Pagination
          aria-label="Invoices"
          page={page}
          totalPages={Math.ceil(invoiceRows.length / pageSize)}
          onPageChange={setPage}
        />
      </div>
    </div>
  );
}

function sortKey(row: InvoiceRow, key: string): string | number {
  if (key === "amount") return row.amount;
  return row[key as keyof InvoiceRow] as string;
}

function statusTone(status: InvoiceRow["status"]): "neutral" | "success" | "warning" | "danger" {
  if (status === "Paid") return "success";
  if (status === "Open") return "neutral";
  return "danger";
}