import { describe, expect, it } from "vitest";
import { ApiError } from "../errors";
import { forbidForeignAttendee } from "../http";
import { assertPublicPayload, PUBLIC_FORBIDDEN_KEYS } from "../presenters";
import {
  assertNoDeveloperConfig,
  DEFAULT_SETTINGS,
  mergeSettings,
  OQ2_UNENFORCED_RULES,
} from "../settings";

describe("public catalogue privacy", () => {
  it("rejects coach rate and identity keys", () => {
    expect(() => assertPublicPayload({ coachRate: "500" })).toThrow(/coachRate/);
    expect(() => assertPublicPayload({ defaultRate: "1", rateType: "PER_SESSION" })).toThrow();
    expect(() => assertPublicPayload({ customerId: "x" })).toThrow();
    expect(PUBLIC_FORBIDDEN_KEYS).toContain("coachRateType");
  });

  it("allows public coach fields", () => {
    expect(() =>
      assertPublicPayload({
        items: [{ id: "coach_rex", name: "Rex", specialties: ["Yoga"], photoKey: "a" }],
      }),
    ).not.toThrow();
  });
});

describe("settings invariants", () => {
  it("seeds Facebook contact values and empty hours", () => {
    expect(DEFAULT_SETTINGS.business.phone).toBe("+63 968 220 9198");
    expect(DEFAULT_SETTINGS.business.email).toBe("balanse.wellnesshub@gmail.com");
    expect(DEFAULT_SETTINGS.business.address).toContain("Capitol Centrum");
    expect(DEFAULT_SETTINGS.business.openingHours).toBe("");
    expect(JSON.stringify(mergeSettings(undefined))).not.toMatch(/hold|cutoff/i);
  });

  it("forbids hold/cutoff on settings payloads", () => {
    expect(() => assertNoDeveloperConfig({ holdDuration: 8 })).toThrow(ApiError);
    expect(() => assertNoDeveloperConfig({ policies: [{ isPlaceholder: true }] })).not.toThrow();
  });
});

describe("booking rules", () => {
  it("rejects attendee impersonation fields", () => {
    expect(() => forbidForeignAttendee({ customerId: "someone-else" })).toThrow(/themselves/);
    expect(() => forbidForeignAttendee({ sessionId: "s1" })).not.toThrow();
  });

  it("documents OQ-2 unenforced reschedule rules", () => {
    expect(OQ2_UNENFORCED_RULES.join(" ")).toMatch(/class type/i);
    expect(OQ2_UNENFORCED_RULES.join(" ")).toMatch(/Price difference/i);
    expect(OQ2_UNENFORCED_RULES.join(" ")).toMatch(/cutoff/i);
    expect(OQ2_UNENFORCED_RULES.join(" ")).toMatch(/Reschedule-count/i);
  });
});
