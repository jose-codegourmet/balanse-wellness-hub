import type { BookingStatus, PrismaClient } from "@prisma/client";
import { seedId } from "./ids";

/**
 * Uploads a placeholder proof object for a `PAYMENT_SUBMITTED` seed booking
 * (WIRE-0905, #364) so the admin signed-URL path has something real to sign.
 * Returns `null` — never a key with no backing object (WIRE-0601/#359,
 * WIRE-0506/#358, WIRE-1108/#362 found this exact bug three times already) —
 * when credentials are missing or the upload itself fails.
 */
async function seedProofObject(bookingId: string): Promise<string | null> {
  const objectKey = `payment-proofs/${bookingId}/placeholder.webp`;
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  const bytes = Buffer.from(
    "UklGRiIAAABXRUJQVlA4IBYAAADQAQCdASoBAAEAAUAmJaQAA3AA/vuUAAA=",
    "base64",
  );
  const uploaded = await fetch(`${url}/storage/v1/object/payment-proofs/${objectKey}`, {
    method: "POST",
    headers: {
      apikey: key,
      authorization: `Bearer ${key}`,
      "content-type": "image/webp",
      "x-upsert": "true",
    },
    body: bytes,
  });
  return uploaded.ok ? objectKey : null;
}

const STATUSES: BookingStatus[] = [
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "CHECKED_IN",
  "WAITLISTED",
  "EXPIRED",
  "CANCELLED",
  "REJECTED",
  "NO_SHOW",
  "COMPLETED",
  "CANCELLATION_REQUESTED",
  "RESCHEDULE_REQUESTED",
];

/** Stable lifecycle rows for the customer booking and admin queue screens. */
export async function seedBookings(prisma: PrismaClient): Promise<void> {
  const sessions = await prisma.gymSession.findMany({
    orderBy: { startsAt: "asc" },
    take: STATUSES.length,
  });
  const policyVersions = await prisma.policyDocumentVersion.findMany({
    where: { isCurrent: true },
    select: { id: true },
  });
  if (sessions.length < STATUSES.length) return;
  for (const [index, status] of STATUSES.entries()) {
    const profileId = seedId(`cust-m-${String((index % 12) + 1).padStart(2, "0")}`);
    const id = `seed-booking-${status.toLowerCase()}`;
    const paid = [
      "PAYMENT_SUBMITTED",
      "CONFIRMED",
      "CHECKED_IN",
      "CANCELLED",
      "REJECTED",
      "NO_SHOW",
      "COMPLETED",
      "CANCELLATION_REQUESTED",
      "RESCHEDULE_REQUESTED",
    ].includes(status);
    await prisma.booking.upsert({
      where: { id },
      create: {
        id,
        profileId,
        sessionId: sessions[index].id,
        status,
        bookingReference: `BWH-SEED-${index + 1}`,
        reservedAt: new Date(`2026-09-${String(10 + index).padStart(2, "0")}T08:00:00.000Z`),
        holdExpiresAt:
          status === "HELD_AWAITING_PAYMENT" ? new Date("2026-12-31T00:00:00.000Z") : null,
        paymentMethod: paid ? "GCASH" : null,
        policyAcceptances: {
          create: policyVersions.map((version) => ({ profileId, policyVersionId: version.id })),
        },
      },
      update: {
        status,
        holdExpiresAt:
          status === "HELD_AWAITING_PAYMENT" ? new Date("2026-12-31T00:00:00.000Z") : null,
      },
    });
    if (paid)
      await prisma.payment.upsert({
        where: { id: `seed-payment-${status.toLowerCase()}` },
        create: {
          id: `seed-payment-${status.toLowerCase()}`,
          bookingId: id,
          method: "GCASH",
          amount: sessions[index].customerPrice,
          status: status === "PAYMENT_SUBMITTED" ? "PROOF_SUBMITTED" : "VERIFIED",
          proofObjectKey: status === "PAYMENT_SUBMITTED" ? await seedProofObject(id) : null,
        },
        update: {},
      });
    if (status === "CANCELLED") {
      // Paid, then cancelled: the studio has already processed the refund.
      await prisma.refund.upsert({
        where: { id: `seed-refund-${status.toLowerCase()}` },
        create: {
          id: `seed-refund-${status.toLowerCase()}`,
          bookingId: id,
          paymentId: `seed-payment-${status.toLowerCase()}`,
          status: "REFUNDED",
          amount: sessions[index].customerPrice,
          markedRefundedAt: new Date("2026-09-20T00:00:00.000Z"),
        },
        update: {},
      });
    }
    // No-shows keep their payment unrefunded by policy (NO_REFUND_ON_NOSHOW_NOTE);
    // REJECTED means the proof itself was rejected, so nothing was ever verified to refund.
    if (status === "CANCELLATION_REQUESTED") {
      await prisma.cancellationRequest.upsert({
        where: { id: `seed-cancellation-request-${status.toLowerCase()}` },
        create: {
          id: `seed-cancellation-request-${status.toLowerCase()}`,
          bookingId: id,
          requesterId: profileId,
          reason: "Schedule conflict.",
          resolution: "OPEN",
        },
        update: {},
      });
    }
    if (status === "RESCHEDULE_REQUESTED") {
      await prisma.rescheduleRequest.upsert({
        where: { id: `seed-reschedule-request-${status.toLowerCase()}` },
        create: {
          id: `seed-reschedule-request-${status.toLowerCase()}`,
          bookingId: id,
          requesterId: profileId,
          fromSessionId: sessions[index].id,
          targetSessionId: sessions[(index + 1) % sessions.length].id,
          preferenceNote: "Would like an earlier slot if possible.",
          resolution: "OPEN",
        },
        update: {},
      });
    }
  }

  // Resolved rows remain in the database after staff action. Keep one example
  // of every outcome alongside the open queue rows above so history views and
  // audit/manual QA have stable, representative data.
  await prisma.cancellationRequest.upsert({
    where: { id: "seed-cancellation-request-completed" },
    create: {
      id: "seed-cancellation-request-completed",
      bookingId: "seed-booking-cancelled",
      requesterId: seedId("cust-m-07"),
      reason: "I can no longer attend this session.",
      resolution: "COMPLETED",
      resolverId: "staff-rex",
      requestedAt: new Date("2026-09-16T08:00:00.000Z"),
      resolvedAt: new Date("2026-09-17T10:00:00.000Z"),
      resolutionNote: "Cancellation completed; refund reviewed separately.",
    },
    update: {},
  });
  await prisma.cancellationRequest.upsert({
    where: { id: "seed-cancellation-request-rejected" },
    create: {
      id: "seed-cancellation-request-rejected",
      bookingId: "seed-booking-confirmed",
      requesterId: seedId("cust-m-03"),
      reason: "Requesting a late cancellation.",
      resolution: "REJECTED",
      resolverId: "staff-rex",
      requestedAt: new Date("2026-09-12T08:00:00.000Z"),
      resolvedAt: new Date("2026-09-12T12:00:00.000Z"),
      resolutionNote: "The booking remains confirmed after review.",
    },
    update: {},
  });
  await prisma.rescheduleRequest.upsert({
    where: { id: "seed-reschedule-request-approved" },
    create: {
      id: "seed-reschedule-request-approved",
      bookingId: "seed-booking-confirmed",
      requesterId: seedId("cust-m-03"),
      fromSessionId: sessions[3].id,
      targetSessionId: sessions[2].id,
      preferenceNote: "An earlier session works better.",
      resolution: "COMPLETED",
      resolverId: "staff-rex",
      requestedAt: new Date("2026-09-11T08:00:00.000Z"),
      resolvedAt: new Date("2026-09-11T10:00:00.000Z"),
      resolutionNote: "Moved to the requested session.",
    },
    update: {},
  });
  await prisma.rescheduleRequest.upsert({
    where: { id: "seed-reschedule-request-rejected" },
    create: {
      id: "seed-reschedule-request-rejected",
      bookingId: "seed-booking-checked_in",
      requesterId: seedId("cust-m-04"),
      fromSessionId: sessions[3].id,
      targetSessionId: sessions[4].id,
      preferenceNote: "Requesting a later session.",
      resolution: "REJECTED",
      resolverId: "staff-rex",
      requestedAt: new Date("2026-09-13T08:00:00.000Z"),
      resolvedAt: new Date("2026-09-13T09:00:00.000Z"),
      resolutionNote: "The current booking remains in place.",
    },
    update: {},
  });
  for (let index = 0; index < 120; index += 1) {
    const profileId = seedId(`cust-q-${String(index + 1).padStart(3, "0")}`);
    const session = sessions[index % sessions.length];
    if (!session) continue;
    const status: BookingStatus = index % 5 === 0 ? "PAYMENT_SUBMITTED" : "CONFIRMED";
    const id = `seed-booking-queue-${String(index + 1).padStart(3, "0")}`;
    await prisma.booking.upsert({
      where: { id },
      create: {
        id,
        profileId,
        sessionId: session.id,
        status,
        bookingReference: `BWH-QUEUE-${String(index + 1).padStart(3, "0")}`,
        reservedAt: new Date(`2026-09-${String((index % 20) + 1).padStart(2, "0")}T08:00:00.000Z`),
        paymentMethod: "GCASH",
        policyAcceptances: {
          create: policyVersions.map((version) => ({ profileId, policyVersionId: version.id })),
        },
      },
      update: { status },
    });
  }
}
