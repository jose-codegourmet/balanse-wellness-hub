import type { ApiFetcher } from "@balanse/api-client";

/** Coach editor with URL-backed profile/photo/financials/sessions tabs and a live preview.
 * Existing admin form schemas/defaults in modules/admin/forms/coach are reused.
 * Preview shows unsaved public fields; rates only render when permission allows.
 * Sessions are read-only, sorted by start time, with loading/error/empty states.
 */
export type CoachFormTabId = "photo" | "profile" | "financials" | "sessions";
export type CoachFormPageProps = {
  coachId: string;
  /** Story fallback; the route prefers ?tab=. */
  initialTab?: CoachFormTabId;
  /** Defaults to the real browser client; stories pass `mockCoachFetcher`. */
  fetcher?: ApiFetcher;
};
