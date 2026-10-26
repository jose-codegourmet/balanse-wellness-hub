import "server-only";
import {
  ApiError,
  listPublicClasses,
  listPublicCoaches,
  listPublicSessions,
} from "@balanse/api-client";
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
  } catch (error) {
    console.error("[balanse/schedule] Public schedule load failed", {
      name: error instanceof Error ? error.name : typeof error,
      status: error instanceof ApiError ? error.status : undefined,
      code: error instanceof ApiError ? error.code : undefined,
    });
    return { sessions: [], classes: [], coaches: [], loadError: true };
  }
}
