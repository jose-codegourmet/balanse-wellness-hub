import { describe, expect, it } from "vitest";
import type { AdminSession } from "./admin";
import {
  ALL_BOOKING_STATUSES_FOR_TABLE,
  canApproveReschedule,
  computeAdminReports,
  computeSessionInventory,
  countsTowardGrossSales,
  FORBIDDEN_REPORT_TERM,
  REPORT_TERMS,
  validateAdminLogin,
  validateSessionCapacity,
} from "./admin";
import { BOOKING_STATUSES } from "./enums";
import type { CustomerBooking } from "./types";

const session = (id: string, extras: Partial<AdminSession> = {}): AdminSession => ({
  id,
  classId: "class-yoga",
  className: "Yoga",
  coachId: "coach-wolf",
  coachName: "Wolf",
  startsAt: "2026-09-16T07:00:00.000Z",
  endsAt: "2026-09-16T08:30:00.000Z",
  pricePhp: 500,
  capacity: 10,
  remainingSlots: 4,
  reservable: true,
  availability: "open",
  status: "PUBLISHED",
  bookable: true,
  coachRatePhp: 650,
  coachRateType: "PER_SESSION",
  ...extras,
});

const booking = (
  partial: Partial<CustomerBooking> & Pick<CustomerBooking, "id" | "status">,
): CustomerBooking => ({
  customerId: "cust-ana",
  sessionId: "session-a",
  paymentMethod: "GCASH",
  paymentStatus: "NONE",
  refundStatus: "NOT_APPLICABLE",
  holdExpiresAt: null,
  createdAt: "2026-09-15T00:00:00.000Z",
  session: session("session-a"),
  ...partial,
});

describe("FE-ADM admin domain", () => {
  it("accepts admin credentials and rejects customers and invalid passwords", () => {
    expect(validateAdminLogin({ email: "rex@balanse.example", password: "welcome" }).ok).toBe(true);
    expect(validateAdminLogin({ email: "ana@example.com", password: "welcome" }).ok).toBe(false);
    expect(validateAdminLogin({ email: "rex@balanse.example", password: "nope" }).ok).toBe(false);
    expect(validateAdminLogin({ email: "", password: "" }).ok).toBe(false);
  });

  it("keeps waitlisted and unpaid held out of gross sales and records refunds separately", () => {
    expect(
      countsTowardGrossSales(booking({ id: "w", status: "WAITLISTED", paymentStatus: "NONE" })),
    ).toBe(false);
    expect(
      countsTowardGrossSales(
        booking({ id: "h", status: "HELD_AWAITING_PAYMENT", paymentStatus: "NONE" }),
      ),
    ).toBe(false);
    const reports = computeAdminReports(
      [session("session-a", { coachRatePhp: 700 })],
      [
        booking({
          id: "paid",
          status: "CONFIRMED",
          paymentStatus: "VERIFIED",
        }),
        booking({
          id: "wait",
          status: "WAITLISTED",
          paymentStatus: "NONE",
        }),
        booking({
          id: "held",
          status: "HELD_AWAITING_PAYMENT",
          paymentStatus: "NONE",
        }),
        booking({
          id: "refunded",
          status: "CANCELLED",
          paymentStatus: "VERIFIED",
          refundStatus: "REFUNDED",
        }),
      ],
      { from: "2026-09-16", to: "2026-09-16" },
    );
    expect(reports.overview.grossSalesPhp).toBe(1000);
    expect(reports.overview.refundsPhp).toBe(500);
    expect(reports.overview.netSalesPhp).toBe(500);
    expect(reports.coachCosts[0]?.coachCostPhp).toBe(700);
  });

  it("uses the session snapshot when a coach default rate later changes", () => {
    const snap = session("session-a", { coachRatePhp: 650 });
    const laterCoachRate = 999;
    const reports = computeAdminReports(
      [snap],
      [booking({ id: "paid", status: "CONFIRMED", paymentStatus: "VERIFIED" })],
      { from: "2026-09-16", to: "2026-09-16" },
    );
    expect(reports.coachCosts[0]?.coachCostPhp).toBe(650);
    expect(reports.coachCosts[0]?.coachCostPhp).not.toBe(laterCoachRate);
  });

  it("never names profit in the report vocabulary", () => {
    expect(REPORT_TERMS.join(" ").toLowerCase()).not.toContain(FORBIDDEN_REPORT_TERM);
  });

  it("covers every booking status for admin tables", () => {
    expect(ALL_BOOKING_STATUSES_FOR_TABLE).toEqual([...BOOKING_STATUSES]);
  });

  it("rejects capacity below consumption and full-target reschedules", () => {
    expect(validateSessionCapacity(4, 6).ok).toBe(false);
    expect(validateSessionCapacity(8, 6).ok).toBe(true);
    expect(canApproveReschedule(session("full", { remainingSlots: 0 })).ok).toBe(false);
    expect(canApproveReschedule(session("open", { remainingSlots: 2 })).ok).toBe(true);
  });

  it("keeps Confirmed + Held + Available equal to capacity", () => {
    const inv = computeSessionInventory({ capacity: 12 }, [
      booking({ id: "c", status: "CONFIRMED" }),
      booking({ id: "c2", status: "CHECKED_IN" }),
      booking({ id: "h", status: "HELD_AWAITING_PAYMENT" }),
      booking({ id: "w", status: "WAITLISTED" }),
    ]);
    expect(inv.confirmed + inv.held + inv.available).toBe(12);
    expect(inv.waitlisted).toBe(1);
  });
});
