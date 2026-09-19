import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { canApproveReschedule, FORBIDDEN_REPORT_TERM } from "@balanse/domain";
import { describe, expect, it } from "vitest";
import { adminSessions, bookings } from "./fixtures";
import { createMemoryAdapter } from "./memory-adapter";
import { resetMockRuntime, setMockRuntime } from "./runtime";

describe("admin mock queues", () => {
  it("exposes payment, cancellation, reschedule, and roster queues", async () => {
    const adapter = createMemoryAdapter();
    const payments = await adapter.getAdminPayments();
    const cancellations = await adapter.getAdminCancellationRequests();
    const reschedules = await adapter.getAdminRescheduleRequests();
    const roster = await adapter.getAdminSessionRoster("session-wed-open");
    expect(payments.some((b) => b.paymentStatus === "PROOF_SUBMITTED")).toBe(true);
    expect(cancellations.length).toBeGreaterThan(0);
    expect(reschedules.length).toBeGreaterThan(0);
    expect(roster.confirmedCount + roster.heldCount + roster.available).toBe(roster.capacity);
    expect(
      roster.waitlisted.every(
        (row, index, all) => index === 0 || all[index - 1].createdAt <= row.createdAt,
      ),
    ).toBe(true);
  });

  it("empties admin queues when the harness flag is on", async () => {
    resetMockRuntime();
    setMockRuntime({ emptyAdminQueues: true });
    const adapter = createMemoryAdapter();
    expect(await adapter.getAdminCancellationRequests()).toEqual([]);
    expect(await adapter.getAdminRescheduleRequests()).toEqual([]);
    expect(await adapter.getAdminPayments()).toEqual([]);
    resetMockRuntime();
  });

  it("blocks reschedule into a full session and keeps coach-rate snapshots", async () => {
    const adapter = createMemoryAdapter();
    await expect(adapter.approveAdminReschedule("booking-reschedule-full")).rejects.toThrow(
      /no remaining capacity/i,
    );
    const full = adminSessions.find((s) => s.id === "session-sat-full");
    expect(full && canApproveReschedule(full).ok).toBe(false);
    const coach = (await adapter.getAdminCoaches()).find((c) => c.id === "coach-rex");
    if (coach) {
      await adapter.upsertAdminCoach({ ...coach, defaultRatePhp: 1200 });
    }
    const session = (await adapter.getAdminSessions()).find((s) => s.id === "session-wed-open");
    expect(session?.coachRatePhp).toBe(800);
  });

  it("keeps waitlisted bookings out of report revenue", async () => {
    const adapter = createMemoryAdapter();
    const reports = await adapter.getAdminReports({
      from: "2026-09-01",
      to: "2026-09-30",
    });
    const waitlisted = bookings.filter((b) => b.status === "WAITLISTED");
    expect(waitlisted.length).toBeGreaterThan(0);
    expect(JSON.stringify(reports).toLowerCase()).not.toContain(FORBIDDEN_REPORT_TERM);
  });

  it("does not leak admin-only modules into apps/web", () => {
    const webFiles = [
      resolve(process.cwd(), "../../apps/web/src/modules/customer/BookingCard.tsx"),
      resolve(process.cwd(), "../../apps/web/src/modules/public/CoachPreviewCard.tsx"),
    ];
    for (const file of webFiles) {
      const source = readFileSync(file, "utf8");
      expect(source).not.toMatch(/defaultRatePhp|coachRatePhp|Coach Cost/);
      expect(source).not.toMatch(/modules\/admin/);
    }
  });
});
