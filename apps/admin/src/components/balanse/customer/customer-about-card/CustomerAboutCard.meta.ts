/**
 * # CustomerAboutCard (#353, epic #343)
 *
 * A customer's onboarding answers for staff: goals, experience level, class
 * interests (class names, linked to admin class pages when `classHref` is
 * given), the `*Other` free texts, and — for staff only — how they heard
 * about us.
 *
 * Shared by three admin routes, so it lives in `components/balanse/customer/`:
 *
 * - `/customers/[customerId]` — `variant="card"`, with heard-from and the
 *   onboarding status for the empty state.
 * - `/students/[customerId]` (Coach) — `variant="card"`, `showHeardFrom={false}`.
 * - `/sessions/[sessionId]/roster` guest sheet — `variant="compact"`: a goals /
 *   experience chip row with an expandable "Interests / Other".
 *
 * Renders what it receives. Visibility is decided by the mock authorization
 * layer (`customers.read`, or the coach assigned to the session / student);
 * when the viewer may not see answers the adapter passes `onboarding: null`.
 * `compact` renders nothing for `null`; `card` shows the empty state
 * "Hasn't completed onboarding yet" with the status when one is given.
 *
 * Class names come from `useInterestClassLookup()` (admin classes with
 * `classes.read`, otherwise the active public catalogue). Unknown ids show as
 * "Unlisted class"; inactive classes get "(inactive)".
 *
 * ## When not to use
 *
 * - Editing answers. Staff cannot edit a customer's answers in this epic.
 * - Aggregate reporting (`/marketing-insights`).
 */
import type { CustomerOnboardingAnswers, OnboardingStatus } from "@balanse/domain";

export type InterestClass = { id: string; name: string; active: boolean };

export type CustomerAboutCardProps = {
  onboarding: CustomerOnboardingAnswers | null;
  /** Shown in the empty state and as a note when answers exist but onboarding isn't complete. */
  onboardingStatus?: OnboardingStatus;
  /** Class lookup by id, usually from `useInterestClassLookup()`. */
  classes: Readonly<Record<string, InterestClass>>;
  /** Admin class page for an interest, or `null` to render plain text. */
  classHref?: ((classId: string) => string | null) | null;
  /** Staff-only marketing answer. Coaches don't see it. Default `true`. */
  showHeardFrom?: boolean;
  variant?: "card" | "compact";
  title?: string;
  className?: string;
};
