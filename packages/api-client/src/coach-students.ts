import type { CoachStudent, CoachStudentDetail } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

/** Coach-scoped only — the server derives the linked coach ID from the bearer token. */
export async function listCoachStudents(fetcher: ApiFetcher): Promise<{ items: CoachStudent[] }> {
  return fetcher("/api/admin/coach/students");
}

/** Returns null when the customer is not a student in the signed-in coach's eligible cohorts. */
export async function getCoachStudent(
  fetcher: ApiFetcher,
  customerId: string,
): Promise<CoachStudentDetail | null> {
  return fetcher(`/api/admin/coach/students/${encodeURIComponent(customerId)}`);
}
