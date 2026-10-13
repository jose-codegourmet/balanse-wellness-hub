import { ApiError, type ApiFetcher } from "@balanse/api-client";
import { getMockAdapter } from "@balanse/mock";

/**
 * Storybook-only `ApiFetcher` for coach routes (WIRE-0605, #359 — stories
 * keep using `getMockAdapter()`). The signed URL is marked `mock:` so
 * `useReplaceCoachPhoto` skips the real PUT step (no storage exists here).
 */
export const mockCoachFetcher: ApiFetcher = async (path, init) => {
  const adapter = getMockAdapter();
  const method = (init?.method ?? "GET").toString().toUpperCase();

  if (path === "/api/public/coaches") {
    return { items: await adapter.getPublicCoaches() } as never;
  }
  if (path === "/api/admin/coaches" && method === "GET") {
    return { items: await adapter.getAdminCoaches() } as never;
  }
  if (path === "/api/admin/coaches" && method === "POST") {
    // Rates are omitted by staff without `coach_rates.manage`; the API defaults them.
    const input = init?.body as Partial<Parameters<typeof adapter.upsertAdminCoach>[0]>;
    return {
      coach: await adapter.upsertAdminCoach({
        name: "",
        specialties: [],
        shortBio: "",
        photoKey: null,
        active: true,
        defaultRatePhp: 0,
        rateType: "PER_SESSION",
        ...input,
      }),
    } as never;
  }
  const patchMatch = /^\/api\/admin\/coaches\/([^/]+)$/.exec(path);
  if (patchMatch && method === "PATCH") {
    // The real PATCH is partial (e.g. `{ active }` from the list's Activate/Deactivate).
    const input = init?.body as Partial<Parameters<typeof adapter.upsertAdminCoach>[0]>;
    const existing = (await adapter.getAdminCoaches()).find((row) => row.id === patchMatch[1]);
    if (!existing) throw new Error(`mockCoachFetcher: coach ${patchMatch[1]} not found`);
    return {
      coach: await adapter.upsertAdminCoach({ ...existing, ...input, id: patchMatch[1] }),
    } as never;
  }
  if (patchMatch && method === "DELETE") {
    // Fixture coaches are all scheduled, so mirror the API's 409 for an in-use coach.
    throw new ApiError(409, {
      code: "coach_in_use",
      message: "This coach is on the schedule. Deactivate them instead.",
    });
  }
  const photoMatch = /^\/api\/admin\/coaches\/([^/]+)\/photo$/.exec(path);
  if (photoMatch && method === "POST") {
    const coachId = photoMatch[1];
    const body = init?.body as { contentType?: string; objectKey?: string } | undefined;
    if (!body?.objectKey) {
      return {
        upload: { signedUrl: "mock:upload", token: "mock", path: "mock", expiresIn: 900 },
        objectKey: `coach-photos/${coachId}/mock-${Date.now()}.jpg`,
        bucket: "coach-photos",
        maxBytes: 5 * 1024 * 1024,
        contentTypes: ["image/jpeg", "image/png", "image/webp"],
      } as never;
    }
    const coaches = await adapter.getAdminCoaches();
    const existing = coaches.find((row) => row.id === coachId);
    if (!existing) throw new Error(`mockCoachFetcher: coach ${coachId} not found`);
    const saved = await adapter.upsertAdminCoach({ ...existing, photoKey: body.objectKey });
    return { coach: { id: saved.id, photoKey: saved.photoKey } } as never;
  }
  if (photoMatch && method === "DELETE") {
    const coachId = photoMatch[1];
    const coaches = await adapter.getAdminCoaches();
    const existing = coaches.find((row) => row.id === coachId);
    if (!existing) throw new Error(`mockCoachFetcher: coach ${coachId} not found`);
    const saved = await adapter.upsertAdminCoach({ ...existing, photoKey: null });
    return { coach: { id: saved.id, photoKey: saved.photoKey } } as never;
  }
  throw new Error(`mockCoachFetcher: unhandled ${method} ${path}`);
};
