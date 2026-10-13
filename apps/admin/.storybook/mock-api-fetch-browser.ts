import type { ApiFetcher } from "@balanse/api-client";
import { mockClassFetcher } from "../src/app/(dashboard)/classes/_components/mock-class-fetcher.stories-data";
import { mockCoachFetcher } from "../src/app/(dashboard)/coaches/_components/mock-coach-fetcher.stories-data";
import { mockStaffFetcher } from "../src/app/(dashboard)/staff/_lib/mock-staff-fetcher.stories-data";
import { mockVenueFetcher } from "../src/app/(dashboard)/venues/_components/mock-venue-fetcher.stories-data";
import { mockCoachStudentsFetcher } from "./mock-coach-students-fetcher";
import { mockClassChangesFetcher } from "./mock-class-changes-fetcher";
import { mockEntityFetcher } from "./mock-entity-fetcher";

/**
 * Storybook-only stand-in for `@balanse/api-client/browser`, aliased in
 * `main.ts` (WIRE-0507/#358, WIRE-0605/#359, WIRE-0706/#360). Real HTTP has
 * no server to answer in a story — and the project's own convention is that
 * stories keep using `getMockAdapter()` after an entity's runtime callers
 * move to real HTTP (`docs/engineering/wire-epics.md`) — so every
 * `apiFetchBrowser` import resolves here instead, dispatching by path to
 * each entity's own mock fetcher. Add a new entity's mock fetcher to this
 * list as it goes real.
 */
export const apiFetchBrowser: ApiFetcher = (path, init) => {
  if (
    path.startsWith("/api/admin/class-change-requests") ||
    /^\/api\/admin\/sessions\/[^/]+\/(substitute-coaches|class-change-requests)$/.test(path)
  ) {
    return mockClassChangesFetcher(path, init);
  }
  if (path.startsWith("/api/admin/coach/students")) {
    return mockCoachStudentsFetcher(path, init);
  }
  if (
    path.startsWith("/api/admin/staff") ||
    path.startsWith("/api/admin/roles") ||
    path === "/api/admin/permissions" ||
    path.startsWith("/api/admin/me")
  ) {
    return mockStaffFetcher(path, init);
  }
  if (path.startsWith("/api/admin/coaches") || path === "/api/public/coaches") {
    return mockCoachFetcher(path, init);
  }
  if (path.startsWith("/api/admin/venues")) {
    return mockVenueFetcher(path, init);
  }
  if (path.startsWith("/api/admin/classes") || path === "/api/public/classes") {
    return mockClassFetcher(path, init);
  }
  return mockEntityFetcher(path, init);
};
