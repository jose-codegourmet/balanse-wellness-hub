import type { ApiFetcher } from "@balanse/api-client";
import { isCoachAuthorizationRole } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { getPreviewStaffActor } from "../src/app/(dashboard)/staff/_lib/mock-staff-fetcher.stories-data";

/** Storybook-only transport for WIRE-2101; production derives scope in the API handler. */
export const mockCoachStudentsFetcher: ApiFetcher = async (path, init) => {
  const method = (init?.method ?? "GET").toUpperCase();
  const actor = getPreviewStaffActor();
  if (!actor || !isCoachAuthorizationRole(actor.roleKey) || !actor.coachId) {
    throw new Error("Only a linked Coach fixture can view students in Storybook.");
  }
  const adapter = getMockAdapter();
  if (path === "/api/admin/coach/students" && method === "GET") {
    const items = (await adapter.getCoachStudents(actor.coachId)).map(
      ({ upcoming: _upcoming, attendance: _attendance, onboarding: _onboarding, ...summary }) =>
        summary,
    );
    return { items } as never;
  }
  const detailMatch = /^\/api\/admin\/coach\/students\/([^/]+)$/.exec(path);
  if (detailMatch && method === "GET") {
    return (await adapter.getCoachStudent(decodeURIComponent(detailMatch[1]), actor.coachId)) as never;
  }
  throw new Error(`mockCoachStudentsFetcher: unhandled ${method} ${path}`);
};
