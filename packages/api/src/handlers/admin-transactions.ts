import type { Prisma } from "@balanse/db";
import {
  type AdminTransactionsPage,
  BUNDLE_ACQUISITION_STATUS_LABELS,
  bookingPaymentRecordStatus,
  bookingReference,
  hasPermission,
  isTransactionsTab,
  matchesTransactionsSearch,
  matchesTransactionsTab,
  packagePurchaseRecordStatus,
  paymentMethodLabel,
  paymentStatusLabel,
  refundRecordStatus,
  refundStatusLabel,
  sessionDisplayName,
  sliceCursorPage,
  sortTransactionRecords,
  TRANSACTIONS_SORT,
  type TransactionRecord,
  transactionTotals,
} from "@balanse/domain";
import { requireAdmin, resolveActor } from "../auth";
import { decodeCursor, parseLimit } from "../cursor";
import { type ApiDeps, staffAuthorizationOf } from "../deps";
import { ApiError } from "../errors";
import { ok, searchParams } from "../http";
import { money } from "../presenters";

const bookingSource = {
  select: {
    id: true,
    status: true,
    reservedAt: true,
    profile: { select: { fullName: true } },
    session: { select: { name: true, gymClass: { select: { name: true } } } },
  },
} satisfies Prisma.BookingDefaultArgs;

type BookingSource = Prisma.BookingGetPayload<typeof bookingSource>;

function bookingFields(booking: BookingSource) {
  return {
    reference: bookingReference(booking.id),
    customer: booking.profile.fullName,
    description: sessionDisplayName({
      name: booking.session.name,
      className: booking.session.gymClass.name,
    }),
    sourceCreatedAt: booking.reservedAt.toISOString(),
    href: `/bookings/${booking.id}`,
  };
}

/**
 * Every booking payment, refund, and paid package purchase in one read model
 * (#378). The ledger is small at studio scale, so each request builds it in one
 * pass: totals come from every record, then the requested tab and search are
 * applied before the keyset slice. Refund rows and refund totals are omitted
 * for staff without `refunds.read`.
 */
export async function getAdminTransactions(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const tab = (params.get("tab") ?? "all").toLowerCase();
  if (!isTransactionsTab(tab)) {
    throw new ApiError(400, "validation_error", "tab must be all, payments, refunds, or pending.");
  }
  const search = params.get("q") ?? undefined;
  const limit = parseLimit(params.get("limit"));
  const cursor = params.get("cursor");
  // Reject a malformed or foreign cursor with the shared 400 before slicing.
  decodeCursor(cursor, TRANSACTIONS_SORT);
  const includeRefunds = hasPermission(staffAuthorizationOf(actor), "refunds.read");

  const [payments, refunds, acquisitions] = await Promise.all([
    deps.prisma.payment.findMany({
      where: { status: { not: "NONE" }, booking: { status: { not: "WAITLISTED" } } },
      select: {
        id: true,
        method: true,
        status: true,
        amount: true,
        booking: bookingSource,
      },
    }),
    includeRefunds
      ? deps.prisma.refund.findMany({
          where: { status: { in: ["REFUND_PENDING", "REFUNDED"] } },
          select: { id: true, status: true, amount: true, booking: bookingSource },
        })
      : Promise.resolve([]),
    deps.prisma.bundleAcquisition.findMany({
      where: { kind: "CUSTOMER_PAID", payment: { isNot: null } },
      select: {
        id: true,
        profileId: true,
        status: true,
        createdAt: true,
        profile: { select: { fullName: true } },
        bundle: { select: { name: true } },
        payment: { select: { method: true, status: true, amount: true } },
      },
    }),
  ]);

  const records: TransactionRecord[] = [];
  for (const payment of payments) {
    records.push({
      ...bookingFields(payment.booking),
      id: `payment:${payment.id}`,
      type: "Booking payment",
      method: paymentMethodLabel(payment.method),
      status: bookingPaymentRecordStatus({
        paymentStatus: payment.status,
        bookingStatus: payment.booking.status,
      }),
      detail: paymentStatusLabel(payment.status),
      amountPhp: Number(money(payment.amount)),
    });
  }
  for (const refund of refunds) {
    records.push({
      ...bookingFields(refund.booking),
      id: `refund:${refund.id}`,
      type: "Refund",
      method: "Manual refund",
      status: refundRecordStatus(refund.status),
      detail: refundStatusLabel(refund.status),
      amountPhp: Number(money(refund.amount)),
    });
  }
  for (const acquisition of acquisitions) {
    const amountPhp = Number(money(acquisition.payment?.amount));
    if (amountPhp <= 0) continue;
    records.push({
      id: `purchase:${acquisition.id}`,
      reference: acquisition.id,
      customer: acquisition.profile.fullName,
      description: acquisition.bundle.name,
      sourceCreatedAt: acquisition.createdAt.toISOString(),
      type: "Package purchase",
      method: paymentMethodLabel(acquisition.payment?.method ?? null),
      status: packagePurchaseRecordStatus(acquisition.status),
      detail: BUNDLE_ACQUISITION_STATUS_LABELS[acquisition.status],
      amountPhp,
      href: `/customers/${acquisition.profileId}`,
    });
  }

  const totals = transactionTotals(records);
  const visible = sortTransactionRecords(
    records.filter(
      (record) => matchesTransactionsTab(record, tab) && matchesTransactionsSearch(record, search),
    ),
  );
  const page = sliceCursorPage(visible, {
    sort: TRANSACTIONS_SORT,
    limit,
    cursor,
    keyOf: (record) => record.sourceCreatedAt,
  });
  const body: AdminTransactionsPage = { tab, sort: TRANSACTIONS_SORT, totals, ...page };
  return ok(body);
}
