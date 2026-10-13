/**
 * Coach-only directory of students from the signed-in coach's sessions
 * (`/students`). Upcoming / Existing cohorts, stat tiles, and an
 * `AdminDataTable` whose Student cell shows `UserAvatar`, the full name, and
 * the nickname as a muted subtitle (#353). Search matches name and nickname.
 * Scope comes from the coach-scoped API, never a client-supplied coach id.
 * The list payload contains summary fields only; onboarding answers and
 * attendance history are fetched by the detail route.
 */
export type CoachStudentsPageProps = {
  empty?: boolean;
};
