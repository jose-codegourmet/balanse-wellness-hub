import { bookingListTab } from "@balanse/domain";
import { requireCustomer, resolveActor, writeAudit } from "../auth";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { asString, forbidForeignAttendee, ok, readJson } from "../http";
import { overlayDerivedQr } from "../payment-qrs";
import {
  bookingStatusPayload,
  groupOwnBookings,
  money,
  PAYMENT_PROOF_MAX_BYTES,
  PAYMENT_PROOF_MIME,
} from "../presenters";
import {
  CANCELLATION_NOTICE,
  OQ2_UNENFORCED_RULES,
  PROOF_REUPLOAD_POLICY,
  readSettings,
} from "../settings";
import {
  createReservation,
  sessionConsumedCapacity,
  submitCancellationRequest,
  submitRescheduleRequest,
} from "../sql";

const bookingInclude = {
  session: {
    include: {
      gymClass: true,
      coaches: { select: { coach: { select: { id: true, name: true, photoKey: true } } } },
    },
  },
  payments: { orderBy: { createdAt: "desc" as const } },
  refunds: { orderBy: { createdAt: "desc" as const } },
  waitlistEntries: true,
};

async function loadOwnBooking(deps: ApiDeps, bookingId: string, userId: string) {
  const booking = await deps.prisma.booking.findUnique({
    where: { id: bookingId },
    include: bookingInclude,
  });
  if (!booking) throw new ApiError(404, "booking_not_found", "Booking not found.");
  if (booking.profileId !== userId) {
    throw new ApiError(403, "forbidden", "You can only access your own bookings.");
  }
  return booking;
}

function presentBooking(booking: Awaited<ReturnType<typeof loadOwnBooking>>) {
  const refund = booking.refunds[0];
  const payment = booking.payments[0];
  return {
    id: booking.id,
    sessionId: booking.sessionId,
    bookingReference: booking.bookingReference,
    holdExpiresAt: booking.holdExpiresAt?.toISOString() ?? null,
    reservedAt: booking.reservedAt.toISOString(),
    paymentMethod: booking.paymentMethod,
    payment: payment
      ? {
          id: payment.id,
          method: payment.method,
          status: payment.status,
          amount: money(payment.amount),
        }
      : null,
    refund: refund ? { id: refund.id, status: refund.status, amount: money(refund.amount) } : null,
    listTab: bookingListTab(booking.status),
    session: {
      id: booking.session.id,
      startsAt: booking.session.startsAt.toISOString(),
      endsAt: booking.session.endsAt.toISOString(),
      className: booking.session.gymClass.name,
      coachName: booking.session.coaches.map(({ coach }) => coach.name).join(" & "),
      coaches: booking.session.coaches.map(({ coach }) => coach),
      customerPrice: money(booking.session.customerPrice),
    },
    ...bookingStatusPayload(booking.status, refund?.status),
  };
}

export async function postBookings(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  forbidForeignAttendee(body);
  const sessionId = asString(body.sessionId);
  if (!sessionId) {
    throw new ApiError(400, "validation_error", "sessionId is required.", {
      fields: { sessionId: "Required." },
    });
  }
  const versions = Array.isArray(body.policyVersionIds)
    ? body.policyVersionIds.filter((item): item is string => typeof item === "string")
    : [];
  const entitlementId = asString(body.entitlementId);
  const created = await createReservation(
    deps,
    actor.userId,
    sessionId,
    versions,
    entitlementId,
    asString(body.intendedEntitlementId) ?? entitlementId,
  );
  const booking = await loadOwnBooking(deps, created.bookingId, actor.userId);
  return ok({
    kind: created.kind,
    waitlistEntryId: created.waitlistEntryId,
    booking: presentBooking(booking),
  });
}

export async function postWaitlist(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const body = await readJson(req);
  forbidForeignAttendee(body);
  const asSession = await deps.prisma.gymSession.findUnique({ where: { id } });
  const asBooking = asSession
    ? null
    : await deps.prisma.booking.findUnique({
        where: { id },
        select: { sessionId: true, profileId: true },
      });
  const sessionId = asSession?.id ?? asBooking?.sessionId;
  if (!sessionId) throw new ApiError(404, "session_not_found", "Session not found.");
  if (asBooking && asBooking.profileId !== actor.userId) {
    throw new ApiError(403, "forbidden", "You can only access your own bookings.");
  }
  const session =
    asSession ?? (await deps.prisma.gymSession.findUnique({ where: { id: sessionId } }));
  if (!session) throw new ApiError(404, "session_not_found", "Session not found.");
  const consumed = await sessionConsumedCapacity(deps, session.id);
  if (consumed < session.capacity) {
    throw new ApiError(
      400,
      "session_not_full",
      "Waitlist join is only available when the session is full.",
    );
  }
  const versions = Array.isArray(body.policyVersionIds)
    ? body.policyVersionIds.filter((item): item is string => typeof item === "string")
    : [];
  const intended = asString(body.intendedEntitlementId) ?? asString(body.entitlementId);
  const created = await createReservation(deps, actor.userId, session.id, versions, null, intended);
  const booking = await loadOwnBooking(deps, created.bookingId, actor.userId);
  return ok({ kind: created.kind, booking: presentBooking(booking) });
}

export async function getBookings(deps: ApiDeps, req: Request): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const rows = await deps.prisma.booking.findMany({
    where: { profileId: actor.userId },
    include: bookingInclude,
    orderBy: { reservedAt: "desc" },
  });
  const items = rows.map((row) => presentBooking(row));
  return ok({ items, ...groupOwnBookings(items) });
}

export async function getBooking(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const booking = await loadOwnBooking(deps, id, actor.userId);
  return ok({ booking: presentBooking(booking) });
}

export async function postPaymentMethod(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const booking = await loadOwnBooking(deps, id, actor.userId);
  const body = await readJson(req);
  const method = asString(body.method);
  if (method !== "GCASH" && method !== "PAY_AT_COUNTER") {
    throw new ApiError(400, "validation_error", "method must be GCASH or PAY_AT_COUNTER.", {
      fields: { method: "Must be GCASH or PAY_AT_COUNTER." },
    });
  }
  const holdExpiresAt = booking.holdExpiresAt;
  await deps.prisma.booking.update({
    where: { id: booking.id },
    data: { paymentMethod: method, holdExpiresAt },
  });
  const existing = booking.payments[0];
  if (existing) {
    await deps.prisma.payment.update({
      where: { id: existing.id },
      data: { method, status: existing.status === "NONE" ? "NONE" : existing.status },
    });
  } else {
    await deps.prisma.payment.create({
      data: {
        bookingId: booking.id,
        method,
        status: "NONE",
        amount: booking.session.customerPrice,
      },
    });
  }
  const refreshed = await loadOwnBooking(deps, booking.id, actor.userId);
  if (
    refreshed.holdExpiresAt?.getTime() !== holdExpiresAt?.getTime() &&
    (refreshed.holdExpiresAt || holdExpiresAt)
  ) {
    await deps.prisma.booking.update({
      where: { id: booking.id },
      data: { holdExpiresAt },
    });
  }
  await writeAudit(deps, {
    entityType: "booking",
    entityId: booking.id,
    action: "payment.method",
    actor,
    metadata: { method },
  });
  const finalBooking = await loadOwnBooking(deps, booking.id, actor.userId);
  return ok({
    booking: presentBooking(finalBooking),
    holdExpiresAt: finalBooking.holdExpiresAt?.toISOString() ?? null,
  });
}

export async function postPaymentProof(deps: ApiDeps, req: Request, id: string): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const booking = await loadOwnBooking(deps, id, actor.userId);
  if (booking.holdExpiresAt && booking.holdExpiresAt.getTime() <= deps.now().getTime()) {
    throw new ApiError(400, "hold_expired", "Proof upload is rejected for expired holds.");
  }
  const body = await readJson(req);
  const contentType = asString(body.contentType);
  const objectKey = asString(body.objectKey);
  if (!objectKey) {
    if (!contentType || !PAYMENT_PROOF_MIME.has(contentType)) {
      throw new ApiError(
        400,
        "invalid_mime",
        "Only jpeg, png, webp, and heic proofs are accepted.",
        {
          fields: { contentType: "Must be image/jpeg, image/png, image/webp, or image/heic." },
        },
      );
    }
    const size = typeof body.byteSize === "number" ? body.byteSize : undefined;
    if (size !== undefined && size > PAYMENT_PROOF_MAX_BYTES) {
      throw new ApiError(400, "file_too_large", "Proof must be 5 MiB or smaller.", {
        fields: { byteSize: "Maximum 5 MiB." },
      });
    }
    const ext =
      contentType === "image/png"
        ? "png"
        : contentType === "image/webp"
          ? "webp"
          : contentType === "image/heic"
            ? "heic"
            : "jpg";
    const path = `payment-proofs/${booking.id}/${crypto.randomUUID()}.${ext}`;
    const upload = await deps.storage.createSignedUpload("payment-proofs", path, { contentType });
    return ok({
      upload,
      policy: PROOF_REUPLOAD_POLICY,
      maxBytes: PAYMENT_PROOF_MAX_BYTES,
      allowedMimeTypes: [...PAYMENT_PROOF_MIME],
    });
  }
  if (booking.paymentMethod === "PAY_AT_COUNTER") {
    throw new ApiError(
      400,
      "cash_does_not_use_proof",
      "Pay at Counter does not require a proof upload.",
    );
  }
  const previousKey = booking.payments[0]?.proofObjectKey ?? null;
  const amount = booking.session.customerPrice;
  const existingSnapshot = booking.payments[0]?.paymentQrCodeId ?? null;
  const activeQr = existingSnapshot
    ? null
    : await deps.prisma.paymentQrCode.findFirst({
        where: { isActive: true, archivedAt: null },
      });
  const paymentQrCodeId = existingSnapshot ?? activeQr?.id ?? null;
  const payment = booking.payments[0]
    ? await deps.prisma.payment.update({
        where: { id: booking.payments[0].id },
        data: {
          method: "GCASH",
          status: "PROOF_SUBMITTED",
          proofObjectKey: objectKey,
          submittedAt: deps.now(),
          amount,
          ...(existingSnapshot ? {} : { paymentQrCodeId }),
        },
      })
    : await deps.prisma.payment.create({
        data: {
          bookingId: booking.id,
          method: "GCASH",
          status: "PROOF_SUBMITTED",
          proofObjectKey: objectKey,
          submittedAt: deps.now(),
          amount,
          paymentQrCodeId,
        },
      });
  if (booking.status === "HELD_AWAITING_PAYMENT") {
    await deps.prisma.$executeRawUnsafe(
      `SELECT public.transition_booking($1, 'PAYMENT_SUBMITTED'::booking_status, 'CUSTOMER'::audit_actor_type, NULL, 'payment.proof', $2::jsonb)`,
      booking.id,
      JSON.stringify({ paymentId: payment.id, replace: Boolean(previousKey), previousKey }),
    );
  } else {
    await writeAudit(deps, {
      entityType: "payment",
      entityId: payment.id,
      action: previousKey ? "payment.proof.replace" : "payment.proof",
      actor,
      metadata: { previousKey, objectKey, policy: PROOF_REUPLOAD_POLICY },
    });
  }
  const refreshed = await loadOwnBooking(deps, booking.id, actor.userId);
  if (refreshed.status === "CONFIRMED") {
    throw new ApiError(
      500,
      "illegal_booking_transition",
      "Proof upload must never confirm a booking.",
    );
  }
  return ok({
    booking: presentBooking(refreshed),
    payment: { id: payment.id, status: payment.status },
    reuploadPolicy: PROOF_REUPLOAD_POLICY,
  });
}

export async function getPaymentInstructions(deps: ApiDeps, req: Request): Promise<Response> {
  requireCustomer(await resolveActor(deps, req));
  const settings = await overlayDerivedQr(deps, await readSettings(deps));
  return ok({
    method: "GCASH",
    accountName: settings.payment.gcashAccountName,
    number: settings.payment.gcashNumber,
    qrObjectKey: settings.payment.gcashQrObjectKey,
    qrPublicUrl: settings.payment.gcashQrPublicUrl,
  });
}

export async function postCancellationRequest(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const booking = await loadOwnBooking(deps, id, actor.userId);
  const open = await deps.prisma.cancellationRequest.findFirst({
    where: { bookingId: booking.id, resolution: "OPEN" },
  });
  if (open) {
    throw new ApiError(
      409,
      "request_already_open",
      "A cancellation request is already open for this booking.",
    );
  }
  const body = await readJson(req);
  const reason = asString(body.reason) ?? null;
  const requestId = await submitCancellationRequest(deps, booking.id, actor.userId, reason);
  const consumed = await sessionConsumedCapacity(deps, booking.sessionId);
  const refreshed = await loadOwnBooking(deps, booking.id, actor.userId);
  return ok({
    requestId,
    notice: CANCELLATION_NOTICE,
    slotStillConsumed: true,
    consumedCapacity: consumed,
    booking: presentBooking(refreshed),
  });
}

export async function postRescheduleRequest(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const actor = requireCustomer(await resolveActor(deps, req));
  const booking = await loadOwnBooking(deps, id, actor.userId);
  const open = await deps.prisma.rescheduleRequest.findFirst({
    where: { bookingId: booking.id, resolution: "OPEN" },
  });
  if (open) {
    throw new ApiError(
      409,
      "request_already_open",
      "A reschedule request is already open for this booking.",
    );
  }
  const body = await readJson(req);
  const targetSessionId = asString(body.targetSessionId);
  if (!targetSessionId) {
    throw new ApiError(400, "validation_error", "targetSessionId is required.", {
      fields: { targetSessionId: "Required. OQ-2 rules are not validated on submit." },
    });
  }
  const requestId = await submitRescheduleRequest(
    deps,
    booking.id,
    actor.userId,
    targetSessionId,
    asString(body.preferenceNote) ?? null,
  );
  const refreshed = await loadOwnBooking(deps, booking.id, actor.userId);
  return ok({
    requestId,
    unenforcedRules: [...OQ2_UNENFORCED_RULES],
    booking: presentBooking(refreshed),
  });
}
