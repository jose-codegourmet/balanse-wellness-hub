import "server-only";
import { listPublicClasses, listPublicCoaches, listPublicSessions } from "@balanse/api-client";
import type { PublicClass, PublicCoach, PublicSession } from "@balanse/domain";
import { serverFetcher } from "@/lib/query/fetcher";
import { SHOWCASE_SCHEDULE_RANGE } from "./showcase-range";

export { SHOWCASE_SCHEDULE_RANGE };

/**
 * Classes, coaches, and sessions all come from the live `/api/public/*`
 * routes (WIRE-0507/#358, WIRE-0605/#359, WIRE-0407/0413/#361).
 */
export async function loadPublicSchedule(): Promise<{
  sessions: PublicSession[];
  classes: PublicClass[];
  coaches: PublicCoach[];
  loadError: boolean;
}> {
  try {
    const fetcher = serverFetcher(null);
    const [sessions, classes, coaches] = await Promise.all([
      listPublicSessions(fetcher, SHOWCASE_SCHEDULE_RANGE).then((res) => res.items),
      listPublicClasses(fetcher).then((res) => res.items),
      listPublicCoaches(fetcher).then((res) => res.items),
    ]);
    return { sessions, classes, coaches, loadError: false };
  } catch {
    return { sessions: [], classes: [], coaches: [], loadError: true };
  }
}
