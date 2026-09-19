import { describe, expect, it } from "vitest";
import { BOOKING_STATUSES } from "./enums";
import {
  BOOKING_STATUS_LABELS,
  bookingStatusLabel,
  CUSTOMER_STATUS_KEYS,
  CUSTOMER_STATUS_LABELS,
  customerStatusLabel,
  isRawStatusToken,
} from "./status-language";

const SPEC_ROWS: Record<(typeof CUSTOMER_STATUS_KEYS)[number], string> = {
  WAITLISTED: "Waitlisted",
  HELD_AWAITING_PAYMENT: "Reserved — Payment Needed",
  PAYMENT_SUBMITTED: "Payment Under Review",
  CONFIRMED: "Confirmed",
  REJECTED: "Not Confirmed",
  CANCELLATION_REQUESTED: "Cancellation Requested",
  RESCHEDULE_REQUESTED: "Reschedule Requested",
  CANCELLED: "Cancelled",
  EXPIRED: "Reservation Expired",
  CHECKED_IN: "Checked In",
  COMPLETED: "Completed",
  NO_SHOW: "No-show",
  REFUND_PENDING: "Refund Pending",
  REFUNDED: "Refunded",
};

describe("FE-SHR-002 status language", () => {
  it("implements all 14 spec rows verbatim, including the em dash", () => {
    expect(CUSTOMER_STATUS_KEYS).toHaveLength(14);
    expect(CUSTOMER_STATUS_LABELS.HELD_AWAITING_PAYMENT).toBe("Reserved — Payment Needed");
    expect(CUSTOMER_STATUS_LABELS.HELD_AWAITING_PAYMENT).toContain("—");
    for (const key of CUSTOMER_STATUS_KEYS) {
      expect(CUSTOMER_STATUS_LABELS[key]).toBe(SPEC_ROWS[key]);
    }
  });

  it("covers every booking status from the domain enum", () => {
    for (const status of BOOKING_STATUSES) {
      expect(bookingStatusLabel(status)).toBe(BOOKING_STATUS_LABELS[status]);
      expect(CUSTOMER_STATUS_KEYS).toContain(status);
    }
  });

  it("never returns a raw enum token as the customer label", () => {
    for (const key of CUSTOMER_STATUS_KEYS) {
      const label = customerStatusLabel(key);
      expect(label).not.toBe(key);
      expect(isRawStatusToken(label)).toBe(false);
      expect(label).not.toMatch(/^[A-Z]+(_[A-Z]+)+$/);
    }
  });
});
