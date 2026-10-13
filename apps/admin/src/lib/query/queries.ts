/**
 * Barrel re-export (#356 WIRE-0106) — the implementation lives one file per
 * entity under `./queries/`. Keep importing from `./queries` (or `@/lib/query/queries`);
 * this file's only job is to preserve that import path while later epics touch
 * one entity file instead of this one monolith.
 */
export * from "./queries/bookings";
export * from "./queries/bundles";
export * from "./queries/cancellations";
export * from "./queries/class-changes";
export * from "./queries/classes";
export * from "./queries/coach-students";
export * from "./queries/coaches";
export * from "./queries/customers";
export * from "./queries/dashboard";
export * from "./queries/events";
export * from "./queries/payments";
export * from "./queries/public-classes";
export * from "./queries/reports";
export * from "./queries/reschedules";
export * from "./queries/roster";
export * from "./queries/sessions";
export * from "./queries/settings";
export * from "./queries/staff";
export * from "./queries/venues";
