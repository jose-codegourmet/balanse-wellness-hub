import { describe, expect, it } from "vitest";
import {
  allBookingStatusesPresentable,
  bookingListTab,
  bookingReference,
  computeHoldExpiresAt,
  customerBookingActions,
  HOLD_DURATION_HOURS,
  needsAttentionKind,
  PROFILE_FIELDS_NOTE,
  paymentMethodLabel,
  paymentStatusLabel,
  safeAppPath,
  validateCustomerLogin,
  validateCustomerSignUp,
  validateForgotPasswordEmail,
} from "./customer-portal";
import { BOOKING_STATUSES } from "./enums";
import { CUSTOMER_STATUS_LABELS } from "./status-language";

describe("FE-CUS customer portal helpers", () => {
  it("caps a 1:00 AM reservation hold at an 8:00 AM class start", () => {
    // 1:00 AM Asia/Manila 16 Sep = 2026-09-15T17:00:00.000Z
    // 8:00 AM Asia/Manila 16 Sep = 2026-09-16T00:00:00.000Z
    // uncapped +8h = 9:00 AM, must cap at class start
    expect(HOLD_DURATION_HOURS).toBe(8);
    const deadline = computeHoldExpiresAt("2026-09-15T17:00:00.000Z", "2026-09-16T00:00:00.000Z");
    expect(deadline.toISOString()).toBe("2026-09-16T00:00:00.000Z");
  });

  it("maps every booking status into a list tab", () => {
    expect(allBookingStatusesPresentable()).toEqual([...BOOKING_STATUSES]);
    expect(bookingListTab("CONFIRMED")).toBe("upcoming");
    expect(bookingListTab("HELD_AWAITING_PAYMENT")).toBe("pending");
    expect(bookingListTab("EXPIRED")).toBe("history");
  });

  it("classifies the three Needs Attention categories from the spec", () => {
    expect(needsAttentionKind("HELD_AWAITING_PAYMENT")).toBe("payment_needed");
    expect(needsAttentionKind("PAYMENT_SUBMITTED")).toBe("payment_under_review");
    expect(needsAttentionKind("CANCELLATION_REQUESTED")).toBe("request_pending");
    expect(needsAttentionKind("RESCHEDULE_REQUESTED")).toBe("request_pending");
    expect(needsAttentionKind("CONFIRMED")).toBeNull();
  });

  it("hides request actions on terminal booking states", () => {
    expect(customerBookingActions("CONFIRMED")).toEqual({ reschedule: true, cancel: true });
    expect(customerBookingActions("CANCELLED")).toEqual({ reschedule: false, cancel: false });
    expect(customerBookingActions("EXPIRED")).toEqual({ reschedule: false, cancel: false });
  });

  it("renders a plain-text reference without inventing a QR format", () => {
    expect(bookingReference("booking-confirmed")).toBe("BWH-CONFIRMED");
  });

  it("validates mock login, including invalid credentials", () => {
    expect(validateCustomerLogin({ email: "", password: "" }).ok).toBe(false);
    expect(validateCustomerLogin({ email: "ana@example.com", password: "nope" }).ok).toBe(false);
    const ok = validateCustomerLogin({ email: "ana@example.com", password: "welcome" });
    expect(ok).toEqual({ ok: true, customerId: "cust-ana" });
  });

  it("validates sign-up without extra OQ-3 fields", () => {
    expect(PROFILE_FIELDS_NOTE).toContain("OQ-3");
    const mismatch = validateCustomerSignUp({
      fullName: "Ada",
      email: "ada@example.com",
      contactNumber: "+63 900",
      password: "password1",
      confirmPassword: "password2",
    });
    expect(mismatch.ok).toBe(false);
    if (!mismatch.ok) expect(mismatch.errors.confirmPassword).toMatch(/match/i);
  });

  it("treats forgot-password invalid email as format-only (no account disclosure)", () => {
    expect(validateForgotPasswordEmail("not-an-email").ok).toBe(false);
    expect(validateForgotPasswordEmail("person@example.com").ok).toBe(true);
  });

  it("never returns raw payment enum tokens as labels", () => {
    expect(paymentMethodLabel("GCASH")).toBe("GCash");
    expect(paymentStatusLabel("PROOF_SUBMITTED")).toBe("Proof submitted");
    expect(CUSTOMER_STATUS_LABELS.HELD_AWAITING_PAYMENT).toBe("Reserved — Payment Needed");
  });

  it("rejects open redirects in returnTo", () => {
    expect(safeAppPath("/portal/book/session-wed-open")).toBe("/portal/book/session-wed-open");
    expect(safeAppPath("https://evil.example")).toBe("/portal");
    expect(safeAppPath("//evil.example")).toBe("/portal");
  });
});
