import type { ColumnDef, RowData } from "@tanstack/react-table";
import type { HTMLAttributes } from "react";
import type { DataTableFeatures } from "./DataTable.features";

export type DataTablePaymentStatus =
  | "pending"
  | "processing"
  | "success"
  | "failed";

export interface DataTablePayment {
  id: string;
  amount: number;
  status: DataTablePaymentStatus;
  email: string;
}

export interface DataTableProps<TData extends RowData = DataTablePayment>
  extends Omit<HTMLAttributes<HTMLDivElement>, "children"> {
  columns?: ColumnDef<DataTableFeatures, TData>[];
  data?: TData[];
}
