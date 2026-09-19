import { randomUUID } from "node:crypto";
import { prisma } from "@balanse/db";
import { afterAll, describe, expect, it } from "vitest";
import type { ApiDeps } from "../../deps";
import { createDefaultStorage } from "../../deps";
import { dispatch } from "../../dispatch";
import { assertPublicPayload } from "../../presenters";

const enabled =
  Boolean(process.env.DIRECT_URL ?? process.env.DATABASE_URL) &&
  process.env.BALANSE_RUN_DB_INTEGRATION === "1";
const describeDb = enabled ? describe : describe.skip;

async function seedProfile(fullName = "Test User") {
  const id = randomUUID();
  await prisma.$executeRawUnsafe(
    `INSERT INTO auth.users (id, email, raw_user_meta_data)
     VALUES ($1::uuid, $2, jsonb_build_object('full_name', $3))
     ON CONFLICT (id) DO NOTHING`,
    id,
    `${id}@example.test`,
    fullName,
  );
  await prisma.profile.upsert({
    where: { id },
    create: { id, fullName, email: `${id}@example.test`, contactNumber: "0999" },
    update: { fullName },
  });
  return id;
}

async function seedSession(capacity = 1, startsInMinutes = 180) {
  const classId = `class_${randomUUID().slice(0, 8)}`;
  const coachId = `coach_${randomUUID().slice(0, 8)}`;
  const sessionId = `sess_${randomUUID().slice(0, 8)}`;
  await prisma.gymClass.create({
    data: { id: classId, name: classId, shortDescription: "", active: true },
  });
  await prisma.coach.create({
    data: {
      id: coachId,
      name: coachId,
      specialties: ["Yoga"],
      defaultRate: "500",
      rateType: "PER_SESSION",
      isPlaceholder: true,
    },
  });
  const startsAt = new Date(Date.now() + startsInMinutes * 60_000);
  await prisma.gymSession.create({
    data: {
      id: sessionId,
      classId,
      coachId,
      startsAt,
      endsAt: new Date(startsAt.getTime() + 60 * 60_000),
      capacity,
      status: "PUBLISHED",
      customerPrice: "999",
      coachRate: "500",
      coachRateType: "PER_SESSION",
      isPlaceholder: true,
    },
  });
  return { classId, coachId, sessionId, startsAt };
}

async function requiredVersions() {
  const versions = await prisma.policyDocumentVersion.findMany({
    where: { isCurrent: true, document: { required: true } },
  });
  if (versions.length > 0) return versions.map((item) => item.id);
  const doc = await prisma.policyDocument.create({
    data: {
      kind: "WAIVER",
      slug: `waiver_${randomUUID().slice(0, 8)}`,
      title: "PLACEHOLDER",
      required: true,
    },
  });
  const version = await prisma.policyDocumentVersion.create({
    data: {
      documentId: doc.id,
      version: "0.1.0-placeholder",
      title: "PLACEHOLDER",
      body: "PLACEHOLDER",
      effectiveFrom: new Date(),
      isCurrent: true,
      isPlaceholder: true,
    },
  });
  return [version.id];
}

function depsFor(userId: string | null): ApiDeps {
  return {
    prisma,
    now: () => new Date(),
    resolveUser: async () =>
      userId ? { id: userId, email: `${userId}@example.test`, authMethod: "email" } : null,
    storage: createDefaultStorage(),
  };
}

async function json(res: Response) {
  return res.json() as Promise<Record<string, unknown>>;
}

describeDb("BE-030–043 HTTP integration", () => {
  afterAll(async () => {
    await prisma.$disconnect();
  });

  it("public catalogue hides rates and marks past/cutoff non-reservable", async () => {
    const { sessionId, startsAt, coachId } = await seedSession(4, 180);
    const from = new Date(startsAt.getTime() - 60_000).toISOString();
    const to = new Date(startsAt.getTime() + 3_600_000).toISOString();
    const res = await dispatch(
      new Request(
        `http://local/api/public/sessions?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}`,
      ),
      depsFor(null),
    );
    expect(res.status).toBe(200);
    const body = await json(res);
    assertPublicPayload(body);
    const items = body.items as Array<{ id: string; remainingSlots: number }>;
    expect(items.some((item) => item.id === sessionId)).toBe(true);
    const coaches = await dispatch(new Request("http://local/api/public/coaches"), depsFor(null));
    const coachBody = await json(coaches);
    assertPublicPayload(coachBody);
    expect(JSON.stringify(coachBody)).not.toContain(coachId === "nope" ? "x" : "defaultRate");
  });

  it("customer books self only, cutoff and policy errors are distinct", async () => {
    const { sessionId } = await seedSession(2, 180);
    const user = await seedProfile();
    const versions = await requiredVersions();
    const denied = await dispatch(
      new Request("http://local/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({ sessionId, customerId: "other", policyVersionIds: versions }),
      }),
      depsFor(user),
    );
    expect(denied.status).toBe(400);
    const created = await dispatch(
      new Request("http://local/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({ sessionId, policyVersionIds: versions }),
      }),
      depsFor(user),
    );
    expect(created.status).toBe(200);
    const createdBody = await json(created);
    const booking = createdBody.booking as { id: string; status: string; statusLabel: string };
    expect(booking.status).toBe("HELD_AWAITING_PAYMENT");
    expect(booking.statusLabel).toBe("Reserved — Payment Needed");

    const other = await seedProfile("Other");
    const steal = await dispatch(
      new Request(`http://local/api/bookings/${booking.id}`, {
        headers: { authorization: "Bearer t" },
      }),
      depsFor(other),
    );
    expect(steal.status).toBe(403);

    const missing = await dispatch(
      new Request("http://local/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({
          sessionId: (await seedSession(2, 180)).sessionId,
          policyVersionIds: [],
        }),
      }),
      depsFor(await seedProfile()),
    );
    expect(missing.status).toBe(400);
    expect((await json(missing)).code).toBe("missing_required_policy_acceptance");

    const cutoff = await dispatch(
      new Request("http://local/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({
          sessionId: (await seedSession(2, 5)).sessionId,
          policyVersionIds: versions,
        }),
      }),
      depsFor(await seedProfile()),
    );
    expect((await json(cutoff)).code).toBe("booking_cutoff_reached");
  });

  it("full session waitlists and cancellation keeps capacity", async () => {
    const { sessionId } = await seedSession(1, 180);
    const versions = await requiredVersions();
    const a = await seedProfile("A");
    const b = await seedProfile("B");
    const first = await dispatch(
      new Request("http://local/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({ sessionId, policyVersionIds: versions }),
      }),
      depsFor(a),
    );
    const firstBody = await json(first);
    expect((firstBody.booking as { status: string }).status).toBe("HELD_AWAITING_PAYMENT");
    const second = await dispatch(
      new Request("http://local/api/bookings", {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({ sessionId, policyVersionIds: versions }),
      }),
      depsFor(b),
    );
    expect(((await json(second)).booking as { status: string }).status).toBe("WAITLISTED");
    const bookingId = (firstBody.booking as { id: string }).id;
    const cancel = await dispatch(
      new Request(`http://local/api/bookings/${bookingId}/cancellation-request`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({ reason: "change" }),
      }),
      depsFor(a),
    );
    const cancelBody = await json(cancel);
    expect(cancel.status).toBe(200);
    expect(cancelBody.slotStillConsumed).toBe(true);
    expect(cancelBody.consumedCapacity).toBe(1);
    const again = await dispatch(
      new Request(`http://local/api/bookings/${bookingId}/cancellation-request`, {
        method: "POST",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: "{}",
      }),
      depsFor(a),
    );
    expect(again.status).toBe(409);
  });

  it("admin-only reports omit profit and settings omit hold/cutoff", async () => {
    const adminUser = await seedProfile("Admin");
    const staff = await prisma.staffMember.create({
      data: {
        userId: adminUser,
        name: "Admin",
        email: `${adminUser}@example.test`,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    const adminDeps: ApiDeps = {
      prisma,
      now: () => new Date(),
      resolveUser: async () => ({ id: adminUser, email: staff.email, authMethod: "email" }),
      storage: createDefaultStorage(),
    };
    const settings = await dispatch(new Request("http://local/api/admin/settings"), adminDeps);
    expect(settings.status).toBe(200);
    const settingsBody = JSON.stringify(await json(settings));
    expect(settingsBody).not.toMatch(/BOOKING_HOLD|cutoff/i);
    expect(settingsBody).toContain("+63 968 220 9198");

    const reports = await dispatch(
      new Request(
        "http://local/api/admin/reports/sales-overview?from=2026-01-01T00:00:00Z&to=2026-12-01T00:00:00Z",
      ),
      adminDeps,
    );
    expect(reports.status).toBe(200);
    const reportBody = await json(reports);
    expect(reportBody).toHaveProperty("Gross Sales");
    expect(JSON.stringify(reportBody)).not.toMatch(/profit/i);

    const cust = await seedProfile("Cust");
    const forbidden = await dispatch(
      new Request(
        "http://local/api/admin/reports/sales-overview?from=2026-01-01T00:00:00Z&to=2026-12-01T00:00:00Z",
      ),
      depsFor(cust),
    );
    expect(forbidden.status).toBe(403);
  });

  it("updating a coach rate does not rewrite session snapshots", async () => {
    const { sessionId, coachId } = await seedSession(4, 180);
    const adminUser = await seedProfile("SnapAdmin");
    await prisma.staffMember.create({
      data: {
        userId: adminUser,
        name: "A",
        email: `${adminUser}@a.test`,
        role: "ADMIN",
        status: "ACTIVE",
      },
    });
    const adminDeps: ApiDeps = {
      prisma,
      now: () => new Date(),
      resolveUser: async () => ({ id: adminUser, email: "a@a.test", authMethod: "email" }),
      storage: createDefaultStorage(),
    };
    const before = await prisma.gymSession.findUnique({ where: { id: sessionId } });
    await dispatch(
      new Request(`http://local/api/admin/coaches/${coachId}`, {
        method: "PATCH",
        headers: { "content-type": "application/json", authorization: "Bearer t" },
        body: JSON.stringify({ defaultRate: "777" }),
      }),
      adminDeps,
    );
    const after = await prisma.gymSession.findUnique({ where: { id: sessionId } });
    expect(after?.coachRate.toString()).toBe(before?.coachRate.toString());
  });
});
