"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTable, createDataTableColumnHelper } from "@/components/data-table";

const columnHelper = createDataTableColumnHelper<AdminInventoryItem>();

export type AdminInventoryItem = {
  id: string;
  productName: string | null;
  sku: string | null;
  onHand: number;
  safetyStock: number | null;
  location: string | null;
};

export const adminInventoryTableColumns: ColumnDef<AdminInventoryItem, any>[] = [
  columnHelper.accessor("productName", {
    header: "Product",
    cell: (info) => {
      const productName = info.getValue();
      return <span>{productName ?? "—"}</span>;
    },
  }),

  columnHelper.accessor("sku", {
    header: "SKU",
    cell: (info) => {
      const sku = info.getValue();
      return <span>{sku ?? "—"}</span>;
    },
  }),

  columnHelper.accessor("onHand", {
    header: "On hand",
    cell: (info) => {
      const onHand = info.getValue();
      return <span>{onHand}</span>;
    },
  }),

  columnHelper.accessor("safetyStock", {
    header: "Safety",
    cell: (info) => {
      const safetyStock = info.getValue();
      return <span>{safetyStock ?? 0}</span>;
    },
  }),

  columnHelper.accessor("location", {
    header: "Location",
    cell: (info) => {
      const location = info.getValue();
      return <span>{location ?? "—"}</span>;
    },
  }),
];

export interface AdminInventoryTableProps {
  items: AdminInventoryItem[];
  emptyTitle?: string;
  emptyDescription?: string;
}

export function AdminInventoryTable({
  items,
  emptyTitle = "No low-stock alerts",
  emptyDescription = "Inventory alerts will appear here as product stock drops.",
}: AdminInventoryTableProps) {
  return (
    <DataTable<AdminInventoryItem>
      data={items}
      columns={adminInventoryTableColumns}
      getRowId={(row) => row.id}
      emptyState={{
        title: emptyTitle,
        description: emptyDescription,
      }}
    />
  );
}


