import type { ApiFetcher } from "@balanse/api-client";
import { getMockAdapter } from "@balanse/mock";

/**
 * Storybook-only `ApiFetcher` for `/api/admin/classes` and `/api/public/classes`
 * (WIRE-0507, #358 — stories keep using `getMockAdapter()` after mock removal
 * from runtime). Routes the same requests `ClassListPage`/`ClassFormPage`
 * send in production to the in-memory adapter instead of a real fetch.
 */
export const mockClassFetcher: ApiFetcher = async (path, init) => {
  const adapter = getMockAdapter();
  const method = (init?.method ?? "GET").toString().toUpperCase();

  if (path === "/api/public/classes") {
    return { items: await adapter.getPublicClasses() } as never;
  }
  if (path === "/api/admin/classes" && method === "GET") {
    return { items: await adapter.getAdminClasses() } as never;
  }
  if (path === "/api/admin/classes" && method === "POST") {
    const input = init?.body as Parameters<typeof adapter.upsertAdminClass>[0];
    return { class: await adapter.upsertAdminClass(input) } as never;
  }
  const patchMatch = /^\/api\/admin\/classes\/(.+)$/.exec(path);
  if (patchMatch && method === "PATCH") {
    const input = init?.body as Parameters<typeof adapter.upsertAdminClass>[0];
    return { class: await adapter.upsertAdminClass({ ...input, id: patchMatch[1] }) } as never;
  }
  if (patchMatch && method === "DELETE") {
    return { deleted: true, id: patchMatch[1] } as never;
  }
  if (path === "/api/admin/class-images" && method === "POST") {
    const body = (init?.body ?? {}) as { contentType?: string; objectKey?: string };
    if (!body.objectKey) {
      const objectKey = `marketing-assets/classes/mock-${Date.now()}.jpg`;
      return {
        upload: { signedUrl: `mock:${objectKey}`, token: "mock", path: objectKey, expiresIn: 900 },
        objectKey,
        bucket: "marketing-assets",
        maxBytes: 5 * 1024 * 1024,
        contentTypes: ["image/jpeg", "image/png", "image/webp"],
      } as never;
    }
    return { objectKey: body.objectKey, url: `https://storage.local/${body.objectKey}` } as never;
  }
  throw new Error(`mockClassFetcher: unhandled ${method} ${path}`);
};
