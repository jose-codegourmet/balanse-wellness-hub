import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import {
  BOOKING_STATUS_LABELS,
  BOOKING_STATUSES,
  COACH_RATE_TYPES,
  PAYMENT_METHODS,
  PAYMENT_STATUSES,
  REFUND_STATUS_LABELS,
  REFUND_STATUSES,
  SESSION_STATUSES,
  STAFF_ROLES,
} from "@balanse/domain";
import { describe, expect, it } from "vitest";

const statusLanguage = readFileSync(
  resolve(import.meta.dirname, "../../../../docs/screen-specs/shared/02-status-language.md"),
  "utf8",
);

describe("BE-001 vocabulary", () => {
  it("maps every booking status to status-language.md", () => {
    for (const status of BOOKING_STATUSES) {
      expect(statusLanguage).toContain(`| ${status} |`);
      expect(BOOKING_STATUS_LABELS[status]).toBeTruthy();
    }
  });

  it("maps customer-facing refund statuses", () => {
    expect(statusLanguage).toContain("| REFUND_PENDING |");
    expect(statusLanguage).toContain("| REFUNDED |");
    expect(REFUND_STATUS_LABELS.REFUND_PENDING).toBe("Refund Pending");
    expect(REFUND_STATUSES).toContain("NOT_APPLICABLE");
  });

  it("keeps payment state distinct and documents internal-only enums", () => {
    expect(PAYMENT_METHODS).toEqual(["GCASH", "PAY_AT_COUNTER"]);
    expect(PAYMENT_STATUSES).toEqual([
      "NONE",
      "PROOF_SUBMITTED",
      "CASH_RECEIVED",
      "VERIFIED",
      "REJECTED",
    ]);
    expect(SESSION_STATUSES).toEqual(["DRAFT", "PUBLISHED", "CANCELLED"]);
    expect(COACH_RATE_TYPES).toEqual(["PER_SESSION", "PER_HOUR"]);
    expect(STAFF_ROLES).toEqual(["ADMIN"]);
    for (const value of PAYMENT_STATUSES) {
      expect(BOOKING_STATUSES).not.toContain(value === "REJECTED" ? "NOPE" : "IMPOSSIBLE");
    }
    expect(BOOKING_STATUSES).toContain("REJECTED");
    expect(PAYMENT_STATUSES).toContain("REJECTED");
  });
});
