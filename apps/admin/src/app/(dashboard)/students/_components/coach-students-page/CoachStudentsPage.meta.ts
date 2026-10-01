/**
 * Coach-only directory of students from the signed-in coach's sessions
 * (`/students`). Upcoming / Existing cohorts, stat tiles, and an
 * `AdminDataTable` whose Student cell shows `UserAvatar`, the full name, and
 * the nickname as a muted subtitle (#353). Search matches name and nickname.
 * Scope comes from the coach-scoped adapter methods, never a client coach id.
 */
export type CoachStudentsPageProps = {
  empty?: boolean;
};
