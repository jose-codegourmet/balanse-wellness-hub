import type { HTMLAttributes } from "react";

export type Table2InvoiceStatus = "paid" | "pending" | "overdue" | "refunded";

export type Table2SortKey = "client" | "due" | "amount";

export type Table2SortDirection = "asc" | "desc";

export interface Table2Invoice {
  id: string;
  client: string;
  initials: string;
  avatar?: string;
  project: string;
  amount: number;
  currency?: string;
  method: string;
  due: string;
  status: Table2InvoiceStatus;
}

export interface Table2Sort {
  key: Table2SortKey;
  direction: Table2SortDirection;
}

export interface Table2Props
  extends Omit<HTMLAttributes<HTMLElement>, "title"> {
  eyebrow?: string;
  title?: string;
  description?: string;
  outstandingLabel?: string;
  searchPlaceholder?: string;
  emptyLabel?: string;
  resultLabel?: string;
  resultsLabel?: string;
  selectedLabel?: string;
  clearLabel?: string;
  markPaidLabel?: string;
  remindLabel?: string;
  downloadLabel?: string;
  viewLabel?: string;
  invoicesLabel?: string;
  pageLabel?: string;
  previousLabel?: string;
  nextLabel?: string;
  footnote?: string;
  invoices?: Table2Invoice[];
  defaultInvoices?: Table2Invoice[];
  defaultSearch?: string;
  pageSize?: number;
  defaultPage?: number;
  defaultSort?: Table2Sort;
  onInvoicesChange?: (invoices: Table2Invoice[]) => void;
  onMarkPaid?: (invoiceIds: string[]) => void;
  onSendReminder?: (invoiceIds: string[]) => void;
  onDownload?: (invoiceIds: string[]) => void;
  onView?: (invoiceId: string) => void;
}
