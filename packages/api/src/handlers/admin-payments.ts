import { requireAdmin, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, pagination, readJson, searchParams } from "../http";
import { money } from "../presenters";
import { transitionRefund } from "../sql";

export async function getAdminPayments(deps: ApiDeps, req: Request): Promise<Response> {
  requireAdmin(await resolveActor(deps, req));
  const params = searchParams(req);
  const tab = (params.get("tab") ?? "gcash_pending").toLowerCase();
  const { page, pageSize, skip } = pagination(params);

  if (tab === "refunds") {
    const refundWhere = {
      status: { in: ["REFUND_PENDING" as const, "REFUNDED" as const] },
    };
    const total = await deps.prisma.refund.count({ where: refundWhere });
    const rows = await deps.prisma.refund.findMany({
      where: refundWhere,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        booking: { include: { profile: true, session: { include: { gymClass: true } } } },
        payment: true,
      },
    });
    return ok({
      tab,
      page,
      pageSize,
      total,
      items: rows.map((row) => ({
        id: row.id,
        bookingId: row.bookingId,
        customerName: row.booking.profile.fullName,
        session: row.booking.session.gymClass.name,
        amount: money(row.amount),
        refundStatus: row.status,
        paymentStatus: row.payment.status,
        bookingStatus: row.booking.status,
        holdExpiresAt: row.booking.holdExpiresAt?.toISOString() ?? null,
      })),
    });
  }

  const where =
    tab === "pay_at_counter"
      ? { method: "PAY_AT_COUNTER" as const }
      : { method: "GCASH" as const, status: { in: ["NONE" as const, "PROOF_SUBMITTED" as const] } };

  const [total, rows] = await Promise.all([
    deps.prisma.payment.count({ where }),
    deps.prisma.payment.findMany({
      where,
      skip,
      take: pageSize,
      orderBy: { createdAt: "desc" },
      include: {
        booking: { include: { profile: true, session: { include: { gymClass: true } } } },
      },
    }),
  ]);
  return ok({
    tab,
    page,
    pageSize,
    total,
    items: rows.map((row) => ({
      id: row.id,
      bookingId: row.bookingId,
      customerName: row.booking.profile.fullName,
      session: row.booking.session.gymClass.name,
      amount: money(row.amount),
      paymentStatus: row.status,
      bookingStatus: row.booking.status,
      holdExpiresAt: row.booking.holdExpiresAt?.toISOString() ?? null,
    })),
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

export async function postRecordCash(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireAdmin(await resolveActor(deps, req));
  const payment = await deps.prisma.payment.findUnique({
    where: { id },
    include: { booking: true },
  });
  if (!payment) throw new ApiError(404, "payment_not_found", "Payment not found.");
  const updated = await deps.prisma.payment.update({
    where: { id },
    data: {
      method: "PAY_AT_COUNTER",
      status: "CASH_RECEIVED",
      reviewedById: actor.staffId,
      reviewedAt: deps.now(),
    },
  });
  await writeAudit(deps, {
    entityType: "payment",
    entityId: payment.id,
    action: "payment.record_cash",
    actor,
    beforeStatus: payment.status,
    afterStatus: updated.status,
    metadata: { bookingId: payment.bookingId, bookingStill: payment.booking.status },
  });
  return ok({
    payment: { id: updated.id, status: updated.status, method: updated.method },
    booking: { id: payment.bookingId, status: payment.booking.status },
    confirmed: false,
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
