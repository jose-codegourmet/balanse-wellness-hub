import { BOOKING_STATUSES } from "@balanse/domain";
import { describe, expect, it } from "vitest";
import { adminCoaches, bookings, publicCoaches, toPublicCoach } from "./fixtures";

describe("public/customer fixture privacy", () => {
  it("omits coach rate fields from the public coach shape", () => {
    for (const coach of publicCoaches) {
      expect("defaultRatePhp" in coach).toBe(false);
      expect("rateType" in coach).toBe(false);
    }
    const stripped = toPublicCoach(adminCoaches[0]);
    expect(stripped).not.toHaveProperty("defaultRatePhp");
    expect(stripped).not.toHaveProperty("rateType");
  });

  it("wires ASSET-012 headshots on eight coaches and keeps three on ASSET-014", () => {
    const withPhoto = publicCoaches.filter((coach) => coach.photoKey);
    const without = publicCoaches.filter((coach) => !coach.photoKey);
    expect(withPhoto.map((coach) => coach.photoKey).sort()).toEqual(
      [
        "coach-photos/ephraim-bacaltos",
        "coach-photos/francis-acido",
        "coach-photos/jodi-tio",
        "coach-photos/maris-cabrera",
        "coach-photos/mikaela-danielle",
        "coach-photos/rachelle-tobiano",
        "coach-photos/rex-francis-regis",
        "coach-photos/wolf",
      ].sort(),
    );
    expect(without.map((coach) => coach.name).sort()).toEqual(
      ["Alec James Co", "Kate Go", "Sofia Ocampo"].sort(),
    );
  });

  it("covers every booking status from the shared language table", () => {
    const present = new Set(bookings.map((b) => b.status));
    for (const status of BOOKING_STATUSES) {
      expect(present.has(status)).toBe(true);
    }
    expect(bookings.some((b) => b.refundStatus === "REFUND_PENDING")).toBe(true);
    expect(bookings.some((b) => b.refundStatus === "REFUNDED")).toBe(true);
  });
});
