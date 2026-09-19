/**
 * BE-019 — single TypeScript source for developer-controlled booking knobs.
 * SQL `developer_config` must store the same values (asserted in @balanse/db tests).
 * Never expose these on an admin settings API (R31, R35).
 *
 * Change process (docs/business-requirements/17-developer-config.md):
 * 1. Rex contacts the developer.
 * 2. Developer updates this module **and** the matching SQL seed/upsert.
 * 3. Change is deployed.
 * 4. Existing bookings keep recorded timestamps and states.
 */

export const BOOKING_HOLD_DURATION_HOURS = 8;
export const BOOKING_CUTOFF_MINUTES_BEFORE_START = 15;

export const DEVELOPER_CONFIG_KEYS = {
  BOOKING_HOLD_DURATION_HOURS: "BOOKING_HOLD_DURATION_HOURS",
  BOOKING_CUTOFF_MINUTES_BEFORE_START: "BOOKING_CUTOFF_MINUTES_BEFORE_START",
} as const;

export const DEVELOPER_CONFIG_DEFAULTS = {
  BOOKING_HOLD_DURATION_HOURS: String(BOOKING_HOLD_DURATION_HOURS),
  BOOKING_CUTOFF_MINUTES_BEFORE_START: String(BOOKING_CUTOFF_MINUTES_BEFORE_START),
} as const;
