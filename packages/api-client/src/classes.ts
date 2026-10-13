import type { PublicClass, SignedUploadIntent } from "@balanse/domain";
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

/** Super Admin only. 409 `class_in_use` when the class has sessions or bundles. */
export async function deleteClass(
  fetcher: ApiFetcher,
  id: string,
): Promise<{ deleted: true; id: string }> {
  return fetcher(`/api/admin/classes/${id}`, { method: "DELETE" });
}

export async function mintClassImage(
  fetcher: ApiFetcher,
  contentType: string,
): Promise<SignedUploadIntent> {
  return fetcher("/api/admin/class-images", { method: "POST", body: { contentType } });
}

/** Confirms the upload and returns the public URL to store on the class. */
export async function confirmClassImage(
  fetcher: ApiFetcher,
  objectKey: string,
): Promise<{ objectKey: string; url: string }> {
  return fetcher("/api/admin/class-images", { method: "POST", body: { objectKey } });
}
