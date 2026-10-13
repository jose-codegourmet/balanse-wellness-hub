import "server-only";
import type { ApiFetcher } from "@balanse/api-client";
import { apiFetchServer } from "@balanse/api-client/server";

/** Binds a server-resolved access token into the shared `ApiFetcher` shape (WIRE-0504, #358). */
export function serverFetcher(accessToken: string | null): ApiFetcher {
  return (path, init) => apiFetchServer(path, init, accessToken);
}
