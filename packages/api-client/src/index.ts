/**
 * `@balanse/api-client` (#356 WIRE-0101). Browser-safe exports only — no
 * `@supabase/ssr` client construction and no `@balanse/api`/Prisma import.
 * The transport variants live behind their own subpaths so each app's
 * bundler only pulls in what that environment needs:
 *
 * - `@balanse/api-client/browser` — call from client components.
 * - `@balanse/api-client/server` — call from Server Components/Actions/Route Handlers.
 */

export * from "./bookings";
export * from "./class-changes";
export * from "./classes";
export * from "./coach-students";
export * from "./coaches";
export * from "./content";
export * from "./customers";
export * from "./errors";
export * from "./events";
export * from "./money";
export * from "./onboarding";
export * from "./packages";
export * from "./pagination";
export * from "./payment-accounts";
export * from "./payments";
export * from "./policies";
export * from "./reports";
export * from "./requests";
export * from "./sessions";
export * from "./settings";
export * from "./staff";
export * from "./uploads";
export * from "./validation";
export * from "./venues";
