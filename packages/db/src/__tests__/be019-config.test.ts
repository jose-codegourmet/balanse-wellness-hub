import {
  BOOKING_CUTOFF_MINUTES_BEFORE_START,
  BOOKING_HOLD_DURATION_HOURS,
  DEVELOPER_CONFIG_DEFAULTS,
} from "@balanse/domain";
import { describe, expect, it } from "vitest";
import {
  BOOKING_CUTOFF_MINUTES_BEFORE_START as dbCutoff,
  BOOKING_HOLD_DURATION_HOURS as dbHold,
} from "../developer-config";

describe("BE-019 developer config", () => {
  it("uses the documented defaults in exactly one TS module pair", () => {
    expect(BOOKING_HOLD_DURATION_HOURS).toBe(8);
    expect(BOOKING_CUTOFF_MINUTES_BEFORE_START).toBe(15);
    expect(dbHold).toBe(BOOKING_HOLD_DURATION_HOURS);
    expect(dbCutoff).toBe(BOOKING_CUTOFF_MINUTES_BEFORE_START);
    expect(DEVELOPER_CONFIG_DEFAULTS.BOOKING_HOLD_DURATION_HOURS).toBe("8");
  });
});
