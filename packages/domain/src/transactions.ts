/**
 * Admin transactions ledger (#378). One row per booking payment record
 * (`payments` with a status other than `NONE`), per refund in flight or done,
 * and per paid package purchase. Totals are computed over every record, never
 * over a page or a tab, so filtering and paging on `/transactions` cannot
 * change the summary figures. Dates are source creation times (booking
 * reservation or package request), not settlement times.
 */

import type { CursorPage } from "./contracts";
import type { BookingStatus, BundleAcquisitionStatus, PaymentStatus, RefundStatus } from "./enums";

export const TRANSACTION_TABS = ["all", "payments", "refunds", "pending"] as const;
export type TransactionsTab = (typeof TRANSACTION_TABS)[number];

/** Keyset sort id bound into the cursor; `sourceCreatedAt DESC, id DESC`. */
export const TRANSACTIONS_SORT = "sourceCreatedAt_desc_id_desc" as const;

export type TransactionRecordType = "Booking payment" | "Package purchase" | "Refund";
export type TransactionRecordStatus = "Completed" | "Pending" | "Rejected" | "Cancelled";

export type TransactionRecord = {
  /** `payment:<paymentId>`, `refund:<refundId>`, or `purchase:<acquisitionId>`. */
  id: string;
  /** Booking reference (`BWH-…`) or the package request id. */
  reference: string;
  customer: string;
  /** Session display name or package name. */
  description: string;
  /** ISO instant the source booking or package request was created. */
  sourceCreatedAt: string;
  type: TransactionRecordType;
  method: string;
  status: TransactionRecordStatus;
  /** Underlying payment, refund, or acquisition status label. */
  detail: string;
  amountPhp: number;
  href: string;
};

export type TransactionTotals = {
  /** Completed booking payments and package purchases. */
  receivedPhp: number;
  /** Completed refunds. */
  refundedPhp: number;
  netPhp: number;
  /** Records still waiting on review, cash, or a refund transfer. */
  pendingCount: number;
};

export type AdminTransactionsQuery = {
  tab?: TransactionsTab;
  /** Matches customer name, reference, or description (case-insensitive). */
  search?: string;
  cursor?: string;
  limit?: number;
};

/** `GET /api/admin/transactions` envelope. `totals` are the same on every page. */
export type AdminTransactionsPage = CursorPage<TransactionRecord> & {
  tab: TransactionsTab;
  sort: typeof TRANSACTIONS_SORT;
  totals: TransactionTotals;
};

export const EMPTY_TRANSACTION_TOTALS: TransactionTotals = {
  receivedPhp: 0,
  refundedPhp: 0,
  netPhp: 0,
  pendingCount: 0,
};

export function isTransactionsTab(value: unknown): value is TransactionsTab {
  return typeof value === "string" && (TRANSACTION_TABS as readonly string[]).includes(value);
}

const CLOSED_BOOKING_STATUSES: readonly BookingStatus[] = ["CANCELLED", "EXPIRED", "REJECTED"];

/**
 * Same rule as `countsTowardGrossSales`: money counts once it is verified or
 * received in cash on a booking that is no longer merely held.
 */
export function bookingPaymentRecordStatus(input: {
  paymentStatus: PaymentStatus;
  bookingStatus: BookingStatus;
}): TransactionRecordStatus {
  const paid = input.paymentStatus === "VERIFIED" || input.paymentStatus === "CASH_RECEIVED";
  if (
    paid &&
    input.bookingStatus !== "HELD_AWAITING_PAYMENT" &&
    input.bookingStatus !== "WAITLISTED"
  ) {
    return "Completed";
  }
  if (input.paymentStatus === "REJECTED") return "Rejected";
  if (CLOSED_BOOKING_STATUSES.includes(input.bookingStatus)) return "Cancelled";
  return "Pending";
}

export function refundRecordStatus(status: RefundStatus): TransactionRecordStatus {
  return status === "REFUNDED" ? "Completed" : "Pending";
}

export function packagePurchaseRecordStatus(
  status: BundleAcquisitionStatus,
): TransactionRecordStatus {
  if (status === "ACTIVE" || status === "APPROVED") return "Completed";
  if (status === "REJECTED") return "Rejected";
  if (status === "CANCELLED") return "Cancelled";
  return "Pending";
}

export function matchesTransactionsTab(record: TransactionRecord, tab: TransactionsTab): boolean {
  switch (tab) {
    case "payments":
      return record.type !== "Refund";
    case "refunds":
      return record.type === "Refund";
    case "pending":
      return record.status === "Pending";
    default:
      return true;
  }
}

export function matchesTransactionsSearch(record: TransactionRecord, search?: string): boolean {
  const q = search?.trim().toLowerCase();
  if (!q) return true;
  return [record.customer, record.reference, record.description].some((value) =>
    value.toLowerCase().includes(q),
  );
}

/** Newest source first; id breaks ties so the cursor is unique. */
export function sortTransactionRecords(records: readonly TransactionRecord[]): TransactionRecord[] {
  return [...records].sort(
    (a, b) => b.sourceCreatedAt.localeCompare(a.sourceCreatedAt) || b.id.localeCompare(a.id),
  );
}

/** Only completed records move money; pending counts every status still in flight. */
export function transactionTotals(records: readonly TransactionRecord[]): TransactionTotals {
  let receivedPhp = 0;
  let refundedPhp = 0;
  let pendingCount = 0;
  for (const record of records) {
    if (record.status === "Pending") pendingCount += 1;
    if (record.status !== "Completed") continue;
    if (record.type === "Refund") refundedPhp += record.amountPhp;
    else receivedPhp += record.amountPhp;
  }
  return { receivedPhp, refundedPhp, netPhp: receivedPhp - refundedPhp, pendingCount };
}
