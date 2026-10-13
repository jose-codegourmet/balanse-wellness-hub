import type { PrismaClient } from "@prisma/client";
import { seedId } from "./ids";

/** WIRE-1405: deterministic package definitions plus enough ledger history to exercise credit totals. */
export async function seedBundles(prisma: PrismaClient): Promise<void> {
  const definitions = [
    {
      id: "bundle-newbie",
      name: "Newbie Package",
      slug: "newbie-package",
      summary: "Twelve sessions to start your Balansé practice.",
      description: "PLACEHOLDER: twelve session credits for any active studio class.",
      sessionCreditCount: 12,
      pricePhp: "0.00",
      applicabilityMode: "ALL_ACTIVE_CLASSES" as const,
      validityDays: null,
      perCustomerLimit: 1,
      status: "PUBLISHED" as const,
      classIds: [] as string[],
    },
    {
      id: "bundle-yoga-eight",
      name: "Yoga 8-Pack",
      slug: "yoga-8-pack",
      summary: "Eight Yoga sessions with manual studio review.",
      description: "PLACEHOLDER: eight credits for Yoga sessions after payment approval.",
      sessionCreditCount: 8,
      pricePhp: "3600.00",
      applicabilityMode: "EXPLICIT_CLASSES" as const,
      validityDays: 90,
      perCustomerLimit: 2,
      status: "PUBLISHED" as const,
      classIds: ["class_yoga"],
    },
    {
      id: "bundle-draft-recovery",
      name: "Recovery Intro",
      slug: "recovery-intro",
      summary: "Draft only — not visible to customers.",
      description: "PLACEHOLDER: staff-only recovery package.",
      sessionCreditCount: 4,
      pricePhp: "0.00",
      applicabilityMode: "EXPLICIT_CLASSES" as const,
      validityDays: 30,
      perCustomerLimit: 1,
      status: "DRAFT" as const,
      classIds: ["class_mat_pilates"],
    },
  ];

  for (const definition of definitions) {
    await prisma.bundle.upsert({
      where: { id: definition.id },
      create: {
        ...definition,
        classApplicability: { create: definition.classIds.map((classId) => ({ classId })) },
      },
      update: {
        name: definition.name,
        slug: definition.slug,
        summary: definition.summary,
        description: definition.description,
        sessionCreditCount: definition.sessionCreditCount,
        pricePhp: definition.pricePhp,
        applicabilityMode: definition.applicabilityMode,
        validityDays: definition.validityDays,
        perCustomerLimit: definition.perCustomerLimit,
        status: definition.status,
        classApplicability: {
          deleteMany: {},
          create: definition.classIds.map((classId) => ({ classId })),
        },
      },
    });
  }

  const ana = seedId("cust-ana");
  const ben = seedId("cust-ben");
  const acquisitions = [
    ["acq-ana-newbie", "bundle-newbie", ana, "CUSTOMER_CLAIM", "APPROVED", "claim:seed:ana:newbie"],
    [
      "acq-ben-yoga-exhausted",
      "bundle-yoga-eight",
      ben,
      "ADMIN_GRANT",
      "APPROVED",
      "grant:seed:ben:yoga",
    ],
    [
      "acq-ben-newbie-expired",
      "bundle-newbie",
      ben,
      "ADMIN_GRANT",
      "APPROVED",
      "grant:seed:ben:newbie",
    ],
    [
      "acq-ben-yoga-pending",
      "bundle-yoga-eight",
      ben,
      "CUSTOMER_PAID",
      "PENDING_REVIEW",
      "purchase:seed:ben:yoga",
    ],
  ] as const;
  for (const [id, bundleId, profileId, kind, status, idempotencyKey] of acquisitions) {
    await prisma.bundleAcquisition.upsert({
      where: { id },
      create: {
        id,
        bundleId,
        profileId,
        kind,
        status,
        idempotencyKey,
        reviewedAt: status === "APPROVED" ? new Date("2026-08-20T00:00:00Z") : null,
      },
      update: { status },
    });
  }

  const entitlements = [
    [
      "ent-ana-newbie",
      "acq-ana-newbie",
      "bundle-newbie",
      ana,
      "ACTIVE",
      12,
      "0.00",
      "ALL_ACTIVE_CLASSES",
      [],
      null,
    ],
    [
      "ent-ben-yoga-exhausted",
      "acq-ben-yoga-exhausted",
      "bundle-yoga-eight",
      ben,
      "EXHAUSTED",
      8,
      "3600.00",
      "EXPLICIT_CLASSES",
      ["class_yoga"],
      new Date("2026-08-30T00:00:00Z"),
    ],
    [
      "ent-ben-newbie-expired",
      "acq-ben-newbie-expired",
      "bundle-newbie",
      ben,
      "EXPIRED",
      12,
      "0.00",
      "ALL_ACTIVE_CLASSES",
      [],
      new Date("2026-02-01T00:00:00Z"),
    ],
  ] as const;
  for (const [
    id,
    acquisitionId,
    bundleId,
    profileId,
    status,
    credits,
    pricePhp,
    mode,
    classIds,
    expiresAt,
  ] of entitlements) {
    await prisma.customerBundle.upsert({
      where: { id },
      create: {
        id,
        acquisitionId,
        bundleId,
        profileId,
        status,
        snapshotName: id.includes("yoga") ? "Yoga 8-Pack" : "Newbie Package",
        snapshotSessionCreditCount: credits,
        snapshotPricePhp: pricePhp,
        snapshotApplicabilityMode: mode,
        snapshotClassIds: [...classIds],
        snapshotValidityDays: id.includes("yoga") ? 90 : null,
        snapshotExpiresAt: expiresAt,
      },
      update: { status, snapshotExpiresAt: expiresAt },
    });
  }

  const sessions = await prisma.gymSession.findMany({
    orderBy: { startsAt: "asc" },
    take: 2,
    select: { id: true },
  });
  const bookings = await prisma.booking.findMany({
    orderBy: { reservedAt: "asc" },
    take: 7,
    select: { id: true },
  });
  if (sessions.length < 1 || bookings.length < 7) return;
  const ledger = [
    ["red-ana-consumed-1", "ent-ana-newbie", "CONSUMED"],
    ["red-ana-consumed-2", "ent-ana-newbie", "CONSUMED"],
    ["red-ana-consumed-3", "ent-ana-newbie", "CONSUMED"],
    ["red-ana-held", "ent-ana-newbie", "HELD"],
    ["red-ana-restored", "ent-ana-newbie", "RESTORED"],
    ["red-ben-yoga-1", "ent-ben-yoga-exhausted", "CONSUMED"],
    ["red-ben-yoga-2", "ent-ben-yoga-exhausted", "CONSUMED"],
  ] as const;
  for (const [index, [id, entitlementId, status]] of ledger.entries()) {
    const booking = bookings[index];
    const session = sessions[index % sessions.length];
    if (!booking || !session) continue;
    const heldAt = new Date(`2026-09-${String(10 + index).padStart(2, "0")}T08:00:00Z`);
    await prisma.bundleRedemption.upsert({
      where: { id },
      create: {
        id,
        entitlementId,
        status,
        bookingId: booking.id,
        sessionId: session.id,
        heldAt,
        consumedAt: status === "CONSUMED" ? heldAt : null,
        restoredAt: status === "RESTORED" ? heldAt : null,
        restoreReason: status === "RESTORED" ? "Seeded lifecycle restoration" : null,
      },
      update: { status },
    });
  }
}
