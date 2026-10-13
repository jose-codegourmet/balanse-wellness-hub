import type { ApiFetcher } from "@balanse/api-client";

/** Coach editor with URL-backed profile/photo/financials/sessions tabs and a live preview.
 * Existing admin form schemas/defaults in modules/admin/forms/coach are reused.
 * Preview shows unsaved public fields; rates only render when permission allows.
 * Sessions are read-only, sorted by start time, with loading/error/empty states.
 * Save sends `defaultRatePhp` / `rateType` only with `coach-rates-manage`; the API rejects them otherwise.
 * Existing coaches get a confirmed "Delete coach" (coaches-manage). The API only deletes coaches
 * with no sessions, class-change requests, or staff link; otherwise it answers 409 `coach_in_use`
 * and the page toasts `coach.delete-blocked` (deactivate instead).
 * A coach is always one staff member. /coaches/new starts with CoachStaffSource: pick active staff
 * without a coach profile (POST /api/admin/coaches with staffId), or invite a new person with the
 * Coach role pre-selected (POST /api/admin/staff with newCoach, then the invite-link dialog).
 * Legacy coaches without staff show CoachLinkStaff ("Link to staff") when the actor has staff.manage.
 */
export type CoachFormTabId = "photo" | "profile" | "financials" | "sessions";
export type CoachFormPageProps = {
  coachId: string;
  /** Story fallback; the route prefers ?tab=. */
  initialTab?: CoachFormTabId;
  /** Defaults to the real browser client; stories pass `mockCoachFetcher`. */
  fetcher?: ApiFetcher;
};
