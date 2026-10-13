import { requireAdmin, requirePermission, resolveActor, writeAudit } from "../auth";
import { cursorPage, decodeCursor, parseLimit } from "../cursor";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson, searchParams } from "../http";
import { money } from "../presenters";
import { confirmBooking, transitionRefund } from "../sql";

const TAB_ALIASES: Record<string, "gcash" | "counter" | "refunds"> = {
  gcash: "gcash",
  gcash_pending: "gcash",
  counter: "counter",
  pay_at_counter: "counter",
  refunds: "refunds",
  refund: "refunds",
};

export async function getAdminPayments(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const tab = TAB_ALIASES[(params.get("tab") ?? "gcash").toLowerCase()];
  if (!tab) {
    throw new ApiError(400, "validation_error", "tab must be gcash, counter, or refunds.");
  }
  const limit = parseLimit(params.get("limit"));

  if (tab === "refunds") {
    const sort = "createdAt_desc_id_desc";
    const cursor = decodeCursor(params.get("cursor"), sort);
    const filters = { status: { in: ["REFUND_PENDING" as const, "REFUNDED" as const] } };
    const where = {
      ...filters,
      ...(cursor
        ? {
            AND: [
              {
                OR: [
                  { createdAt: { lt: new Date(cursor.key as string) } },
                  { createdAt: new Date(cursor.key as string), id: { lt: cursor.id } },
                ],
              },
            ],
          }
        : {}),
    };
    const [totalCount, rows] = await Promise.all([
      deps.prisma.refund.count({ where: filters }),
      deps.prisma.refund.findMany({
        where,
        take: limit + 1,
        orderBy: [{ createdAt: "desc" }, { id: "desc" }],
        include: {
          booking: { include: { profile: true, session: { include: { gymClass: true } } } },
          payment: true,
        },
      }),
    ]);
    const mapped = rows.map((row) => ({
      id: row.bookingId,
      bookingId: row.bookingId,
      refundId: row.id,
      paymentId: row.paymentId,
      customerId: row.booking.profileId,
      customerName: row.booking.profile.fullName,
      sessionId: row.booking.sessionId,
      status: row.booking.status,
      paymentMethod: row.payment.method,
      session: {
        id: row.booking.session.id,
        classId: row.booking.session.classId,
        className: row.booking.session.gymClass.name,
        coaches: [],
        startsAt: row.booking.session.startsAt.toISOString(),
        endsAt: row.booking.session.endsAt.toISOString(),
        customerPrice: money(row.amount),
        capacity: row.booking.session.capacity,
        remainingSlots: 0,
        status: row.booking.session.status,
      },
      refundStatus: row.status,
      paymentStatus: row.payment.status,
      reservedAt: row.booking.reservedAt.toISOString(),
      createdAt: row.booking.reservedAt.toISOString(),
      requestCreatedAt: row.createdAt.toISOString(),
      holdExpiresAt: row.booking.holdExpiresAt?.toISOString() ?? null,
    }));
    return ok({
      tab,
      sort,
      ...cursorPage(mapped, limit, totalCount, sort, (row) => row.requestCreatedAt),
    });
  }

  const sort = "holdExpiresAt_asc_id_asc";
  const cursor = decodeCursor(params.get("cursor"), sort);
  const cursorClause = cursor
    ? {
        AND: [
          {
            OR: [
              { booking: { holdExpiresAt: { gt: new Date(cursor.key as string) } } },
              {
                booking: { holdExpiresAt: new Date(cursor.key as string) },
                id: { gt: cursor.id },
              },
            ],
          },
        ],
      }
    : {};

  const filters =
    tab === "gcash"
      ? // Proofs still awaiting review on a live booking. A confirmed or rejected
        // booking's payment is resolved with it, but never list a closed booking.
        {
          method: "GCASH" as const,
          status: "PROOF_SUBMITTED" as const,
          booking: {
            status: { in: ["PAYMENT_SUBMITTED" as const, "HELD_AWAITING_PAYMENT" as const] },
          },
        }
      : // Counter work still to do: held bookings not paying by GCash. Once cash is
        // received the booking is confirmed and leaves this queue.
        {
          booking: { status: "HELD_AWAITING_PAYMENT" as const },
          NOT: { method: "GCASH" as const },
        };

  const [totalCount, rows] = await Promise.all([
    deps.prisma.payment.count({ where: filters }),
    deps.prisma.payment.findMany({
      where: { AND: [filters, cursorClause] },
      take: limit + 1,
      orderBy: [{ booking: { holdExpiresAt: "asc" } }, { id: "asc" }],
      include: {
        booking: { include: { profile: true, session: { include: { gymClass: true } } } },
      },
    }),
  ]);
  const mapped = rows.map((row) => ({
    id: row.bookingId,
    bookingId: row.bookingId,
    paymentId: row.id,
    customerId: row.booking.profileId,
    customerName: row.booking.profile.fullName,
    sessionId: row.booking.sessionId,
    status: row.booking.status,
    paymentMethod: row.method,
    session: {
      id: row.booking.session.id,
      classId: row.booking.session.classId,
      className: row.booking.session.gymClass.name,
      coaches: [],
      startsAt: row.booking.session.startsAt.toISOString(),
      endsAt: row.booking.session.endsAt.toISOString(),
      customerPrice: money(row.amount),
      capacity: row.booking.session.capacity,
      remainingSlots: 0,
      status: row.booking.session.status,
    },
    paymentStatus: row.status,
    /** The card loads the image through `/api/admin/payment-proofs/{id}/signed-url`. */
    hasProof: Boolean(row.proofObjectKey),
    refundStatus: "NOT_APPLICABLE",
    reservedAt: row.booking.reservedAt.toISOString(),
    createdAt: row.booking.reservedAt.toISOString(),
    holdExpiresAt: row.booking.holdExpiresAt?.toISOString() ?? null,
  }));
  return ok({
    tab,
    sort,
    ...cursorPage(mapped, limit, totalCount, sort, (row) => row.holdExpiresAt),
  });
}

export async function getPaymentProofSignedUrl(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const payment = await deps.prisma.payment.findUnique({ where: { id } });
  if (!payment?.proofObjectKey) {
    throw new ApiError(404, "proof_not_found", "No payment proof is stored for this payment.");
  }
  const expiresIn = 120;
  const signedUrl = await deps.storage.createSignedUrl(
    "payment-proofs",
    payment.proofObjectKey,
    expiresIn,
  );
  await writeAudit(deps, {
    entityType: "payment",
    entityId: payment.id,
    action: "payment.proof.signed_url",
    actor,
    metadata: { expiresIn, proofObjectKey: payment.proofObjectKey },
  });
  return ok({ signedUrl, expiresIn });
}

const CONFIRMABLE_ON_CASH = new Set(["HELD_AWAITING_PAYMENT", "PAYMENT_SUBMITTED"]);

/**
 * Record cash received at the counter. With `{ "confirm": true }` the booking is
 * confirmed in the same transaction, so a paid booking can never be left held
 * (and expired by the hold job) or confirmed with no payment on record.
 */
export async function postRecordCash(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const confirm = body.confirm === true;
  // Confirming is its own permission; record-cash access alone must not confirm.
  if (confirm) requirePermission(actor, "bookings.confirm");
  const payment = await deps.prisma.payment.findUnique({
    where: { id },
    include: { booking: true },
  });
  if (!payment) throw new ApiError(404, "payment_not_found", "Payment not found.");
  if (confirm && !CONFIRMABLE_ON_CASH.has(payment.booking.status)) {
    throw new ApiError(
      409,
      "booking_not_confirmable",
      "This booking is no longer waiting for payment. Refresh the queue.",
    );
  }
  const updated = await deps.prisma.$transaction(async (tx) => {
    const row = await tx.payment.update({
      where: { id },
      data: {
        method: "PAY_AT_COUNTER",
        status: "CASH_RECEIVED",
        reviewedById: actor.staffId,
        reviewedAt: deps.now(),
      },
    });
    if (confirm) {
      await tx.booking.update({
        where: { id: payment.bookingId },
        data: { paymentMethod: "PAY_AT_COUNTER" },
      });
      await confirmBooking(deps, payment.bookingId, actor.staffId, tx);
    }
    return row;
  });
  const booking = await deps.prisma.booking.findUnique({ where: { id: payment.bookingId } });
  await writeAudit(deps, {
    entityType: "payment",
    entityId: payment.id,
    action: "payment.record_cash",
    actor,
    beforeStatus: payment.status,
    afterStatus: updated.status,
    metadata: {
      bookingId: payment.bookingId,
      bookingBefore: payment.booking.status,
      bookingAfter: booking?.status ?? payment.booking.status,
      confirmed: confirm,
    },
  });
  return ok({
    payment: { id: updated.id, status: updated.status, method: updated.method },
    booking: { id: payment.bookingId, status: booking?.status ?? payment.booking.status },
    confirmed: confirm,
  });
}

/**
 * Reject a GCash receipt without rejecting the booking. The payment becomes
 * REJECTED (reason kept on the `payment.reject` audit row, which the customer's
 * booking read returns), and a booking under review goes back to
 * HELD_AWAITING_PAYMENT with its original hold, so the customer can pay again.
 * Rejecting the whole booking stays `POST /api/admin/bookings/{id}/reject`.
 */
export async function postRejectPaymentProof(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  requirePermission(actor, "payments.review");
  const body = await readJson(req);
  const reason = asString(body.reason)?.trim() ?? "";
  if (!reason) {
    throw new ApiError(400, "validation_error", "Tell the customer why the receipt was rejected.", {
      fields: { reason: "Required." },
    });
  }
  const payment = await deps.prisma.payment.findUnique({
    where: { id },
    include: { booking: true },
  });
  if (!payment) throw new ApiError(404, "payment_not_found", "Payment not found.");
  if (payment.status !== "PROOF_SUBMITTED") {
    throw new ApiError(409, "proof_not_pending", "This receipt is no longer waiting for review.");
  }
  await deps.prisma.$transaction(async (tx) => {
    await tx.payment.update({
      where: { id },
      data: { status: "REJECTED", reviewedById: actor.staffId, reviewedAt: deps.now() },
    });
    if (payment.booking.status === "PAYMENT_SUBMITTED") {
      await tx.$executeRawUnsafe(
        `SELECT public.transition_booking($1, 'HELD_AWAITING_PAYMENT'::booking_status, 'STAFF'::audit_actor_type, $2, 'payment.reject', $3::jsonb)`,
        payment.bookingId,
        actor.staffId,
        JSON.stringify({ reason }),
      );
    }
  });
  await writeAudit(deps, {
    entityType: "payment",
    entityId: payment.id,
    action: "payment.reject",
    actor,
    beforeStatus: "PROOF_SUBMITTED",
    afterStatus: "REJECTED",
    metadata: { bookingId: payment.bookingId, reason },
  });
  const booking = await deps.prisma.booking.findUnique({ where: { id: payment.bookingId } });
  return ok({
    payment: { id: payment.id, status: "REJECTED" },
    booking: { id: payment.bookingId, status: booking?.status ?? payment.booking.status },
  });
}

async function loadOrCreateRefund(deps: ApiDeps, id: string) {
  const existing = await deps.prisma.refund.findUnique({ where: { id } });
  if (existing) return existing;
  const payment = await deps.prisma.payment.findUnique({ where: { id } });
  if (!payment) throw new ApiError(404, "refund_not_found", "Refund not found.");
  return deps.prisma.refund.create({
    data: {
      bookingId: payment.bookingId,
      paymentId: payment.id,
      status: "NOT_APPLICABLE",
      amount: payment.amount,
    },
  });
}

export async function postMarkRefundPending(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const refund = await loadOrCreateRefund(deps, id);
  await transitionRefund(
    deps,
    refund.id,
    "REFUND_PENDING",
    actor.staffId,
    asString(body.note) ?? null,
  );
  const updated = await deps.prisma.refund.findUnique({ where: { id: refund.id } });
  return ok({ refund: updated });
}

export async function postMarkRefunded(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const body = await readJson(req);
  const refund = await deps.prisma.refund.findUnique({ where: { id } });
  if (!refund) throw new ApiError(404, "refund_not_found", "Refund not found.");
  await transitionRefund(deps, refund.id, "REFUNDED", actor.staffId, asString(body.note) ?? null);
  const updated = await deps.prisma.refund.findUnique({ where: { id } });
  return ok({ refund: updated });
}
