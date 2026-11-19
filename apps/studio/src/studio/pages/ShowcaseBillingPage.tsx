import { useMemo, useState } from "react";
import { Badge, Button, DataTable, Drawer, InlineAlert, PageHeader, Pagination, toastManager, type DataTableSort } from "@b4/react";
import { invoiceRows } from "../sampleData.js";
import type { StudioPreviewWidth } from "../settings.js";

type InvoiceRow = (typeof invoiceRows)[number];

export function ShowcaseBillingPage({ previewWidth }: { previewWidth: StudioPreviewWidth }) {
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<DataTableSort | undefined>();
  const [paidOverrides, setPaidOverrides] = useState<Set<string>>(new Set());
  const [openInvoiceId, setOpenInvoiceId] = useState<string | null>(null);

  const frameClass =
    previewWidth === "390"
      ? "b4-studio__preview-frame--390"
      : previewWidth === "768"
        ? "b4-studio__preview-frame--768"
        : previewWidth === "1440"
          ? "b4-studio__preview-frame--1440"
          : "";

  const rowsWithOverrides = useMemo<InvoiceRow[]>(
    () => invoiceRows.map((row) => (paidOverrides.has(row.id) ? { ...row, status: "Paid" as const } : row)),
    [paidOverrides],
  );

  const sortedRows = useMemo(() => {
    const copy = [...rowsWithOverrides];
    if (!sort) return copy;
    copy.sort((a, b) => {
      const av = sortKey(a, sort.columnKey);
      const bv = sortKey(b, sort.columnKey);
      const cmp = av < bv ? -1 : av > bv ? 1 : 0;
      return sort.direction === "asc" ? cmp : -cmp;
    });
    return copy;
  }, [rowsWithOverrides, sort]);

  const openInvoice = openInvoiceId ? rowsWithOverrides.find((row) => row.id === openInvoiceId) : undefined;

  function markAsPaid(id: string) {
    setPaidOverrides((prev) => new Set(prev).add(id));
    setOpenInvoiceId(null);
    toastManager.add({ title: "Invoice marked as paid", type: "success" });
  }

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
            {
              key: "actions",
              header: "",
              render: (row) => (
                <Button variant="ghost" size="sm" onClick={() => setOpenInvoiceId(row.id)}>
                  View
                </Button>
              ),
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

      <Drawer
        title={openInvoice?.id ?? "Invoice"}
        description={openInvoice ? `${openInvoice.customer} · ${openInvoice.plan}` : undefined}
        open={Boolean(openInvoiceId)}
        onOpenChange={(open) => setOpenInvoiceId(open ? openInvoiceId : null)}
      >
        {openInvoice && (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--b4-space-6)" }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Amount</span>
              <strong>${openInvoice.amount.toLocaleString()}</strong>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span>Status</span>
              <Badge tone={statusTone(openInvoice.status)}>{openInvoice.status}</Badge>
            </div>
            {openInvoice.status !== "Paid" && (
              <Button variant="primary" onClick={() => markAsPaid(openInvoice.id)}>
                Mark as paid
              </Button>
            )}
          </div>
        )}
      </Drawer>
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