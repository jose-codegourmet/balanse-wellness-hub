import "server-only";
import type { ApiFetcher } from "@balanse/api-client";
import { apiFetchServer } from "@balanse/api-client/server";

/** Bind this request's customer token to the shared API client shape. */
export function serverFetcher(accessToken: string | null): ApiFetcher {
  return (path, init) => apiFetchServer(path, init, accessToken);
}
