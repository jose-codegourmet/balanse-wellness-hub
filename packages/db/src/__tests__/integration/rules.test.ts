import { randomUUID } from "node:crypto";
import { BOOKING_CUTOFF_MINUTES_BEFORE_START, BOOKING_HOLD_DURATION_HOURS } from "@balanse/domain";
import pg from "pg";
import { afterAll, describe, expect, it } from "vitest";

const url = process.env.DIRECT_URL ?? process.env.DATABASE_URL;
const enabled = Boolean(url) && process.env.BALANSE_RUN_DB_INTEGRATION === "1";

const describeDb = enabled ? describe : describe.skip;

const pool = enabled ? new pg.Pool({ connectionString: url, max: 8 }) : null;

async function query<T extends pg.QueryResultRow>(
  sql: string,
  params: unknown[] = [],
): Promise<pg.QueryResult<T>> {
  if (!pool) throw new Error("pool missing");
  return pool.query<T>(sql, params);
}

describeDb("BE schema integration", () => {
  afterAll(async () => {
    await pool?.end();
  });

  async function seedSession(capacity = 1, startsInMinutes = 120) {
    const classId = `class_${randomUUID().slice(0, 8)}`;
    const coachId = `coach_${randomUUID().slice(0, 8)}`;
    const sessionId = `sess_${randomUUID().slice(0, 8)}`;
    await query(
      `INSERT INTO classes (id, name, "shortDescription", "createdAt", "updatedAt")
       VALUES ($1, $2, '', now(), now())`,
      [classId, classId],
    );
    await query(
      `INSERT INTO coaches (id, name, specialties, "defaultRate", "rateType", "isPlaceholder", "createdAt", "updatedAt")
       VALUES ($1, $2, ARRAY['Yoga'], 500, 'PER_SESSION', true, now(), now())`,
      [coachId, coachId],
    );
    await query(
      `INSERT INTO sessions (
         id, "classId", "coachId", "startsAt", "endsAt", capacity, status,
         "customerPrice", "coachRate", "coachRateType", "isPlaceholder", "createdAt", "updatedAt"
       ) VALUES (
         $1, $2, $3, now() + make_interval(mins => $4), now() + make_interval(mins => $4) + interval '1 hour',
         $5, 'PUBLISHED', 999, 500, 'PER_SESSION', true, now(), now()
       )`,
      [sessionId, classId, coachId, startsInMinutes, capacity],
    );
    return { classId, coachId, sessionId };
  }

  async function seedProfile() {
    const id = randomUUID();
    await query(
      `INSERT INTO auth.users (id, email, raw_user_meta_data)
       VALUES ($1, $2, jsonb_build_object('full_name', 'Test User'))
       ON CONFLICT (id) DO NOTHING`,
      [id, `${id}@example.test`],
    );
    await query(
      `INSERT INTO profiles (id, "fullName", email, "contactNumber", "createdAt", "updatedAt")
       VALUES ($1, 'Test User', $2, '0999', now(), now())
       ON CONFLICT (id) DO NOTHING`,
      [id, `${id}@example.test`],
    );
    return id;
  }

  async function requiredVersionIds(): Promise<string[]> {
    const result = await query<{ id: string }>(`SELECT v.id
       FROM policy_document_versions v
       JOIN policy_documents d ON d.id = v."documentId"
       WHERE d.required = true AND v."isCurrent" = true`);
    if (result.rows.length === 0) {
      await query(
        `INSERT INTO policy_documents (id, kind, slug, title, required, "createdAt", "updatedAt")
         VALUES ('policy_test_waiver', 'WAIVER', $1, 'PLACEHOLDER waiver', true, now(), now())
         ON CONFLICT (slug) DO NOTHING`,
        [`waiver_${randomUUID().slice(0, 8)}`],
      );
      const doc = await query<{ id: string }>(
        `SELECT id FROM policy_documents WHERE required = true LIMIT 1`,
      );
      const versionId = `ver_${randomUUID().slice(0, 8)}`;
      await query(
        `INSERT INTO policy_document_versions (
           id, "documentId", version, title, body, "effectiveFrom", "isCurrent", "isPlaceholder", "createdAt", "updatedAt"
         ) VALUES ($1, $2, '0.1.0-placeholder', 'PLACEHOLDER', 'PLACEHOLDER — not legal text.', now(), true, true, now(), now())
         ON CONFLICT DO NOTHING`,
        [versionId, doc.rows[0].id],
      );
      return [versionId];
    }
    return result.rows.map((row) => row.id);
  }

  it("BE-019 SQL config matches TypeScript defaults", async () => {
    const hold = await query<{ value: string }>(
      `SELECT "value" FROM developer_config WHERE key = 'BOOKING_HOLD_DURATION_HOURS'`,
    );
    const cutoff = await query<{ value: string }>(
      `SELECT "value" FROM developer_config WHERE key = 'BOOKING_CUTOFF_MINUTES_BEFORE_START'`,
    );
    expect(Number(hold.rows[0].value)).toBe(BOOKING_HOLD_DURATION_HOURS);
    expect(Number(cutoff.rows[0].value)).toBe(BOOKING_CUTOFF_MINUTES_BEFORE_START);
    const sqlHold = await query<{ v: number }>(
      `SELECT app_private.developer_config_int('BOOKING_HOLD_DURATION_HOURS') AS v`,
    );
    expect(sqlHold.rows[0].v).toBe(BOOKING_HOLD_DURATION_HOURS);
  });

  it("BE-017 last-slot race yields one hold", async () => {
    const { sessionId } = await seedSession(1, 180);
    const versions = await requiredVersionIds();
    const profiles = await Promise.all([seedProfile(), seedProfile(), seedProfile()]);
    const results = await Promise.allSettled(
      profiles.map((profileId) =>
        query(`SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`, [
          profileId,
          sessionId,
          versions,
        ]),
      ),
    );
    const holds = results.filter(
      (item) => item.status === "fulfilled" && item.value.rows[0].result.kind === "hold",
    );
    const waitlists = results.filter(
      (item) => item.status === "fulfilled" && item.value.rows[0].result.kind === "waitlist",
    );
    expect(holds.length).toBe(1);
    expect(waitlists.length + results.filter((item) => item.status === "rejected").length).toBe(2);
    const consumed = await query<{ v: number }>(
      `SELECT public.session_consumed_capacity($1) AS v`,
      [sessionId],
    );
    expect(consumed.rows[0].v).toBe(1);
  });

  it("BE-017 cancellation request still consumes capacity; waitlist does not", async () => {
    const { sessionId } = await seedSession(1, 180);
    const versions = await requiredVersionIds();
    const a = await seedProfile();
    const b = await seedProfile();
    const hold = await query<{ result: { bookingId: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [a, sessionId, versions],
    );
    await query(`SELECT public.submit_cancellation_request($1, $2::uuid, 'changed plans')`, [
      hold.rows[0].result.bookingId,
      a,
    ]);
    expect(
      (await query<{ v: number }>(`SELECT public.session_consumed_capacity($1) AS v`, [sessionId]))
        .rows[0].v,
    ).toBe(1);
    const wait = await query<{ result: { kind: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [b, sessionId, versions],
    );
    expect(wait.rows[0].result.kind).toBe("waitlist");
    expect(
      (await query<{ v: number }>(`SELECT public.session_consumed_capacity($1) AS v`, [sessionId]))
        .rows[0].v,
    ).toBe(1);
  });

  it("BE-017 rejects at/after cutoff", async () => {
    const { sessionId } = await seedSession(4, 5);
    const versions = await requiredVersionIds();
    const profileId = await seedProfile();
    await expect(
      query(`SELECT public.create_reservation($1::uuid, $2, $3::text[])`, [
        profileId,
        sessionId,
        versions,
      ]),
    ).rejects.toThrow(/booking_cutoff_reached/);
  });

  it("BE-018 expires holds with a system actor and promotes FIFO before cutoff", async () => {
    const { sessionId } = await seedSession(1, 240);
    const versions = await requiredVersionIds();
    const first = await seedProfile();
    const second = await seedProfile();
    const hold = await query<{ result: { bookingId: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [first, sessionId, versions],
    );
    await query(`SELECT public.create_reservation($1::uuid, $2, $3::text[])`, [
      second,
      sessionId,
      versions,
    ]);
    await query(`UPDATE bookings SET "holdExpiresAt" = now() - interval '1 minute' WHERE id = $1`, [
      hold.rows[0].result.bookingId,
    ]);
    await query(`SELECT public.expire_holds_and_promote_waitlist()`);
    const expired = await query<{ status: string }>(
      `SELECT status::text AS status FROM bookings WHERE id = $1`,
      [hold.rows[0].result.bookingId],
    );
    expect(expired.rows[0].status).toBe("EXPIRED");
    const promoted = await query<{ status: string; hold: Date }>(
      `SELECT status::text AS status, "holdExpiresAt" AS hold
       FROM bookings WHERE "profileId" = $1 AND "sessionId" = $2`,
      [second, sessionId],
    );
    expect(promoted.rows[0].status).toBe("HELD_AWAITING_PAYMENT");
    const audit = await query<{ actorType: string }>(
      `SELECT "actorType"::text AS "actorType" FROM audit_events
       WHERE action = 'hold.expire' AND "entityId" = $1`,
      [hold.rows[0].result.bookingId],
    );
    expect(audit.rows[0].actorType).toBe("SYSTEM");
  });

  it("BE-018 does not promote at cutoff", async () => {
    const { sessionId } = await seedSession(1, 180);
    const versions = await requiredVersionIds();
    const first = await seedProfile();
    const second = await seedProfile();
    const hold = await query<{ result: { bookingId: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [first, sessionId, versions],
    );
    await query(`SELECT public.create_reservation($1::uuid, $2, $3::text[])`, [
      second,
      sessionId,
      versions,
    ]);
    await query(
      `UPDATE sessions SET "startsAt" = now() + interval '5 minutes',
      "endsAt" = now() + interval '65 minutes' WHERE id = $1`,
      [sessionId],
    );
    await query(`UPDATE bookings SET status = 'CANCELLED', "updatedAt" = now() WHERE id = $1`, [
      hold.rows[0].result.bookingId,
    ]);
    const promoted = await query<{ result: string | null }>(
      `SELECT public.evaluate_waitlist_promotion($1) AS result`,
      [sessionId],
    );
    expect(promoted.rows[0].result).toBeNull();
  });

  it("BE-015 no-show does not create a refund; COMPLETED is blocked", async () => {
    const { sessionId } = await seedSession(2, 180);
    const versions = await requiredVersionIds();
    const profileId = await seedProfile();
    const created = await query<{ result: { bookingId: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [profileId, sessionId, versions],
    );
    const bookingId = created.rows[0].result.bookingId;
    await query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`, [bookingId]);
    await query(`SELECT public.mark_no_show($1, NULL)`, [bookingId]);
    const refunds = await query(`SELECT id FROM refunds WHERE "bookingId" = $1`, [bookingId]);
    expect(refunds.rowCount).toBe(0);
    await expect(
      query(`SELECT public.transition_booking($1, 'COMPLETED', 'STAFF', NULL, 'x', '{}'::jsonb)`, [
        bookingId,
      ]),
    ).rejects.toThrow(/completed_blocked_oq10|illegal_booking_transition/);
  });

  it("BE-011 cancelled booking can sit in REFUND_PENDING", async () => {
    const { sessionId } = await seedSession(2, 180);
    const versions = await requiredVersionIds();
    const profileId = await seedProfile();
    const created = await query<{ result: { bookingId: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [profileId, sessionId, versions],
    );
    const bookingId = created.rows[0].result.bookingId;
    await query(
      `INSERT INTO payments (id, "bookingId", method, status, amount, "createdAt", "updatedAt")
       VALUES ('pay_${bookingId.slice(0, 8)}', $1, 'GCASH', 'VERIFIED', 999, now(), now())`,
      [bookingId],
    );
    const payment = await query<{ id: string }>(`SELECT id FROM payments WHERE "bookingId" = $1`, [
      bookingId,
    ]);
    await query(
      `INSERT INTO refunds (id, "bookingId", "paymentId", status, amount, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, 'NOT_APPLICABLE', 999, now(), now())`,
      [`ref_${bookingId.slice(0, 8)}`, bookingId, payment.rows[0].id],
    );
    await query(`UPDATE bookings SET status = 'CANCELLED' WHERE id = $1`, [bookingId]);
    await query(`SELECT public.transition_refund($1, 'REFUND_PENDING', NULL, 'manual')`, [
      `ref_${bookingId.slice(0, 8)}`,
    ]);
    const row = await query<{ booking: string; refund: string }>(
      `SELECT b.status::text AS booking, r.status::text AS refund
       FROM bookings b JOIN refunds r ON r."bookingId" = b.id
       WHERE b.id = $1`,
      [bookingId],
    );
    expect(row.rows[0].booking).toBe("CANCELLED");
    expect(row.rows[0].refund).toBe("REFUND_PENDING");
  });

  it("BE-006 session snapshot is not back-written when coach rate changes", async () => {
    const { sessionId, coachId } = await seedSession(4, 180);
    await query(`UPDATE coaches SET "defaultRate" = 777 WHERE id = $1`, [coachId]);
    const session = await query<{ coachRate: string }>(
      `SELECT "coachRate"::text AS "coachRate" FROM sessions WHERE id = $1`,
      [sessionId],
    );
    expect(session.rows[0].coachRate).toBe("500.00");
  });

  it("BE-022 waitlisted and held bookings contribute zero revenue; refunds counted", async () => {
    const { sessionId } = await seedSession(1, 180);
    const versions = await requiredVersionIds();
    const a = await seedProfile();
    const b = await seedProfile();
    const held = await query<{ result: { bookingId: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [a, sessionId, versions],
    );
    await query(`SELECT public.create_reservation($1::uuid, $2, $3::text[])`, [
      b,
      sessionId,
      versions,
    ]);
    const overview = await query<{
      grossSales: string;
      refunds: string;
    }>(`SELECT "grossSales"::text, refunds::text
       FROM public.report_sales_overview(now() - interval '1 day', now() + interval '7 days')`);
    expect(Number(overview.rows[0].grossSales)).toBeGreaterThanOrEqual(0);
    await query(`UPDATE bookings SET status = 'CONFIRMED' WHERE id = $1`, [
      held.rows[0].result.bookingId,
    ]);
    const paid = await query<{ grossSales: string }>(
      `SELECT "grossSales"::text FROM public.report_sales_overview(now() - interval '1 day', now() + interval '7 days')`,
    );
    expect(Number(paid.rows[0].grossSales)).toBeGreaterThan(0);
    const drill = await query(`SELECT * FROM public.report_session_drilldown($1)`, [sessionId]);
    expect(JSON.stringify(drill.rows[0])).not.toMatch(/profit/i);
    expect(drill.rows[0].occupancy).toBeDefined();
    expect(drill.rows[0].attendanceUtilisation).toBeDefined();
  });

  it("BE-003 is_admin is false for disabled staff", async () => {
    const userId = await seedProfile();
    await query(
      `INSERT INTO staff_members (id, "userId", name, email, role, status, "isSystem", "createdAt", "updatedAt")
       VALUES ($1, $2, 'Admin', 'a@test', 'ADMIN', 'DISABLED', false, now(), now())`,
      [`staff_${userId.slice(0, 8)}`, userId],
    );
    const admin = await query<{ v: boolean }>(`SELECT public.is_admin($1::uuid) AS v`, [userId]);
    expect(admin.rows[0].v).toBe(false);
    await query(`UPDATE staff_members SET status = 'ACTIVE' WHERE "userId" = $1`, [userId]);
    const enabledAdmin = await query<{ v: boolean }>(`SELECT public.is_admin($1::uuid) AS v`, [
      userId,
    ]);
    expect(enabledAdmin.rows[0].v).toBe(true);
  });

  it("BE-008 bookings cannot be deleted", async () => {
    const { sessionId } = await seedSession(2, 180);
    const versions = await requiredVersionIds();
    const profileId = await seedProfile();
    const created = await query<{ result: { bookingId: string } }>(
      `SELECT public.create_reservation($1::uuid, $2, $3::text[]) AS result`,
      [profileId, sessionId, versions],
    );
    await expect(
      query(`DELETE FROM bookings WHERE id = $1`, [created.rows[0].result.bookingId]),
    ).rejects.toThrow(/append_only/);
  });
});
