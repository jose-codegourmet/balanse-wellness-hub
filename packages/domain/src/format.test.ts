import { describe, expect, it } from "vitest";
import {
  BUSINESS_TIME_ZONE,
  effectiveHoldDeadline,
  formatHoldDeadline,
  formatPeso,
  formatSessionRange,
} from "./format";

describe("formatPeso", () => {
  it("renders the peso sign with two decimals", () => {
    expect(formatPeso(1000)).toMatch(/^₱1,000\.00$/);
    expect(formatPeso(0)).toMatch(/^₱0\.00$/);
    expect(formatPeso(75.5)).toMatch(/^₱75\.50$/);
  });
});

describe("Asia/Manila display", () => {
  it("documents the business timezone", () => {
    expect(BUSINESS_TIME_ZONE).toBe("Asia/Manila");
  });

  it("formats a same-day session from UTC instants as Manila wall time", () => {
    // 2026-09-16 08:00–09:00 Asia/Manila = 2026-09-16 00:00–01:00Z
    const text = formatSessionRange("2026-09-16T00:00:00.000Z", "2026-09-16T01:00:00.000Z");
    expect(text).toContain("Sep 16, 2026");
    expect(text).toContain("8:00");
    expect(text).toContain("9:00");
    expect(text).toContain("Asia/Manila");
    expect(text).not.toContain(" – ");
  });

  it("formats a cross-midnight range on both calendar days", () => {
    const text = formatSessionRange("2026-09-16T15:30:00.000Z", "2026-09-16T16:30:00.000Z");
    expect(text).toContain("Sep 16, 2026");
    expect(text).toContain("Sep 17, 2026");
    expect(text).toContain("Asia/Manila");
  });
});

describe("hold deadline cap", () => {
  it("never displays a deadline after class start", () => {
    const hold = "2026-09-16T08:00:00.000Z";
    const start = "2026-09-16T01:00:00.000Z";
    const effective = effectiveHoldDeadline(hold, start);
    expect(effective.toISOString()).toBe(start);
    const label = formatHoldDeadline(hold, start);
    expect(label).toContain("Reservation held until");
    expect(label).toContain("9:00");
  });

  it("uses the hold when it is earlier than class start", () => {
    const hold = "2026-09-16T00:00:00.000Z";
    const start = "2026-09-16T08:00:00.000Z";
    expect(effectiveHoldDeadline(hold, start).toISOString()).toBe(hold);
  });
});
