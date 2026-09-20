import { requireAdmin, resolveActor, writeAudit } from "../auth";
import { cursorPage, decodeCursor, parseLimit } from "../cursor";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, ok, readJson, searchParams } from "../http";
import { money } from "../presenters";
import { transitionRefund } from "../sql";

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
      id: row.id,
      bookingId: row.bookingId,
      customerName: row.booking.profile.fullName,
      session: row.booking.session.gymClass.name,
      amount: money(row.amount),
      refundStatus: row.status,
      paymentStatus: row.payment.status,
      bookingStatus: row.booking.status,
      requestedAt: row.createdAt.toISOString(),
      holdExpiresAt: row.booking.holdExpiresAt?.toISOString() ?? null,
    }));
    return ok({
      tab,
      sort,
      ...cursorPage(mapped, limit, totalCount, sort, (row) => row.requestedAt),
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
      ? { method: "GCASH" as const, status: "PROOF_SUBMITTED" as const }
      : {
          OR: [
            { method: "PAY_AT_COUNTER" as const },
            {
              booking: { status: "HELD_AWAITING_PAYMENT" as const },
              NOT: { method: "GCASH" as const },
            },
          ],
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
    id: row.id,
    bookingId: row.bookingId,
    customerName: row.booking.profile.fullName,
    session: row.booking.session.gymClass.name,
    amount: money(row.amount),
    paymentStatus: row.status,
    bookingStatus: row.booking.status,
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
