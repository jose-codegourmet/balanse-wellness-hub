import { getPublicEvent, getPublicSession } from "@balanse/api-client";
import { serverFetcher } from "@/lib/query/fetcher";
import { isPublicShareReturn } from "./return-to";

/**
 * Human name for the shared page `returnTo` points at ("Reformer Pilates",
 * "Pilates for a Cause"), or null when it isn't one or can't be resolved.
 * Server only. Sessions and events read their public API page routes.
 */
export async function publicReturnLabel(path: string): Promise<string | null> {
  if (!isPublicShareReturn(path)) return null;
  const segments = (path.split(/[?#]/)[0] ?? "").split("/").filter(Boolean);
  const id = segments[3] ? decodeURIComponent(segments[3]) : null;
  if (!id) return null;
  try {
    if (segments[0] === "events") {
      const event = await getPublicEvent(serverFetcher(null), id);
      return event.title;
    }
    const session = await getPublicSession(serverFetcher(null), id);
    return session.name?.trim() || session.className;
  } catch {
    return null;
  }
}
