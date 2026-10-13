import type { PublicClass } from "@balanse/domain";
import type { ApiFetchInit } from "./request";

/**
 * Transport-agnostic fetch shape (WIRE-0503, #358): `apiFetchBrowser` already
 * matches this signature; a server caller binds its access token into a
 * matching closure around `apiFetchServer`.
 */
export type ApiFetcher = <T = unknown>(path: string, init?: ApiFetchInit) => Promise<T>;

export type ClassInput = Omit<PublicClass, "id">;

export async function listPublicClasses(fetcher: ApiFetcher): Promise<{ items: PublicClass[] }> {
  return fetcher("/api/public/classes");
}

export async function listAdminClasses(fetcher: ApiFetcher): Promise<{ items: PublicClass[] }> {
  return fetcher("/api/admin/classes");
}

export async function createClass(
  fetcher: ApiFetcher,
  input: ClassInput,
): Promise<{ class: PublicClass }> {
  return fetcher("/api/admin/classes", { method: "POST", body: input });
}

export async function patchClass(
  fetcher: ApiFetcher,
  id: string,
  input: Partial<ClassInput>,
): Promise<{ class: PublicClass }> {
  return fetcher(`/api/admin/classes/${id}`, { method: "PATCH", body: input });
}
