import {
  BUNDLE_ACQUISITION_STATUS_LABELS,
  type BundleAcquisition,
  type CustomerBooking,
  countsTowardGrossSales,
  paymentMethodLabel,
  paymentStatusLabel,
  refundStatusLabel,
  sessionDisplayName,
} from "@balanse/domain";

export type TransactionRecord = {
  id: string;
  reference: string;
  customer: string;
  description: string;
  sourceCreatedAt: string;
  type: "Booking payment" | "Package purchase" | "Refund";
  method: string;
  status: "Completed" | "Pending" | "Rejected" | "Cancelled";
  detail: string;
  amountPhp: number;
  href: string;
};

/** Current financial states from mock source records; never fabricate settlement dates. */
export function transactionRecords(
  bookings: CustomerBooking[],
  acquisitions: BundleAcquisition[],
  customers: { id: string; fullName: string }[],
): TransactionRecord[] {
  const names = new Map(customers.map((customer) => [customer.id, customer.fullName]));
  const records: TransactionRecord[] = [];
  for (const booking of bookings) {
    // Redeeming package credits is not another cash payment.
    if (booking.entitlementId || booking.redemption || booking.status === "WAITLISTED") continue;
    const source = {
      reference: booking.id,
      customer: names.get(booking.customerId) ?? booking.customerName ?? booking.customerId,
      description: sessionDisplayName(booking.session),
      sourceCreatedAt: booking.createdAt,
      amountPhp: booking.session.pricePhp,
      href: `/bookings/${booking.id}`,
    };
    const paid = countsTowardGrossSales(booking);
    if (
      booking.paymentStatus !== "NONE" ||
      (booking.paymentMethod && booking.status === "HELD_AWAITING_PAYMENT")
    ) {
      records.push({
        ...source,
        id: `payment:${booking.id}`,
        type: "Booking payment",
        method: paymentMethodLabel(booking.paymentMethod),
        status: paid
          ? "Completed"
          : booking.paymentStatus === "REJECTED"
            ? "Rejected"
            : ["CANCELLED", "EXPIRED", "REJECTED"].includes(booking.status)
              ? "Cancelled"
              : "Pending",
        detail: paymentStatusLabel(booking.paymentStatus),
      });
    }
    if (booking.refundStatus !== "NOT_APPLICABLE") {
      records.push({
        ...source,
        id: `refund:${booking.id}`,
        type: "Refund",
        method: "Manual refund",
        status: booking.refundStatus === "REFUNDED" ? "Completed" : "Pending",
        detail: refundStatusLabel(booking.refundStatus),
      });
    }
  }
  for (const acquisition of acquisitions) {
    if (acquisition.channel !== "SELF_PURCHASE" || acquisition.pricePhp <= 0) continue;
    records.push({
      id: `purchase:${acquisition.id}`,
      reference: acquisition.id,
      customer: names.get(acquisition.customerId) ?? acquisition.customerId,
      description: acquisition.bundleName,
      sourceCreatedAt: acquisition.createdAt,
      type: "Package purchase",
      method: "Not recorded",
      status:
        acquisition.status === "ACTIVE" || acquisition.status === "APPROVED"
          ? "Completed"
          : acquisition.status === "REJECTED"
            ? "Rejected"
            : acquisition.status === "CANCELLED"
              ? "Cancelled"
              : "Pending",
      detail: BUNDLE_ACQUISITION_STATUS_LABELS[acquisition.status],
      amountPhp: acquisition.pricePhp,
      href: `/customers/${acquisition.customerId}`,
    });
  }
  return records.sort(
    (a, b) => b.sourceCreatedAt.localeCompare(a.sourceCreatedAt) || a.id.localeCompare(b.id),
  );
}

export function transactionTotals(records: TransactionRecord[]) {
  let received = 0;
  let refunded = 0;
  let pending = 0;
  for (const record of records) {
    if (record.status === "Pending") pending += 1;
    if (record.status !== "Completed") continue;
    if (record.type === "Refund") refunded += record.amountPhp;
    else received += record.amountPhp;
  }
  return { received, refunded, net: received - refunded, pending };
}
