import { getMockAdapter } from "@balanse/mock";
import { isPublicShareReturn } from "./return-to";

/**
 * Human name for the shared page `returnTo` points at ("Reformer Pilates",
 * "Pilates for a Cause"), or null when it isn't one or can't be resolved.
 * Server only: reads the mock adapter.
 */
export async function publicReturnLabel(path: string): Promise<string | null> {
  if (!isPublicShareReturn(path)) return null;
  const segments = (path.split(/[?#]/)[0] ?? "").split("/").filter(Boolean);
  const id = segments[3] ? decodeURIComponent(segments[3]) : null;
  if (!id) return null;
  try {
    if (segments[0] === "events") {
      const event = await getMockAdapter().getPublicEventPage(id);
      return event?.title ?? null;
    }
    const session = await getMockAdapter().getPublicSessionPage(id);
    return session ? session.name?.trim() || session.className : null;
  } catch {
    return null;
  }
}
