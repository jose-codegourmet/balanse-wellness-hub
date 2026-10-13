import type { ApiFetcher } from "@balanse/api-client";
import { getMockAdapter } from "@balanse/mock";

/**
 * Storybook-only `ApiFetcher` for `/api/admin/venues` (WIRE-0706, #360 —
 * stories keep using `getMockAdapter()`).
 */
export const mockVenueFetcher: ApiFetcher = async (path, init) => {
  const adapter = getMockAdapter();
  const method = (init?.method ?? "GET").toString().toUpperCase();

  if (path.startsWith("/api/admin/venues") && method === "GET") {
    return { items: await adapter.getAdminVenues() } as never;
  }
  if (path === "/api/admin/venues" && method === "POST") {
    const input = init?.body as Parameters<typeof adapter.upsertAdminVenue>[0];
    return { venue: await adapter.upsertAdminVenue(input) } as never;
  }
  const patchMatch = /^\/api\/admin\/venues\/([^/]+)$/.exec(path);
  if (patchMatch && method === "PATCH") {
    const input = init?.body as Parameters<typeof adapter.upsertAdminVenue>[0];
    return { venue: await adapter.upsertAdminVenue({ ...input, id: patchMatch[1] }) } as never;
  }
  throw new Error(`mockVenueFetcher: unhandled ${method} ${path}`);
};
