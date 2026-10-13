"use client";

/**
 * Barrel re-export (#356 WIRE-0106) — the implementation lives one file per
 * entity under `./mutations/`. Keep importing from `./mutations` (or
 * `@/lib/query/mutations`); this file's only job is to preserve that import
 * path while later epics touch one entity file instead of this one monolith.
 */
export * from "./mutations/bookings";
export * from "./mutations/bundles";
export * from "./mutations/cancellations";
export * from "./mutations/class-changes";
export * from "./mutations/classes";
export * from "./mutations/coaches";
export * from "./mutations/events";
export * from "./mutations/payments";
export * from "./mutations/reschedules";
export * from "./mutations/roster";
export * from "./mutations/sessions";
export * from "./mutations/settings";
export * from "./mutations/staff";
export * from "./mutations/venues";
