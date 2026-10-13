import "server-only";

import { dispatch } from "@balanse/api";
import { errorFromResponse } from "./errors";
import { type ApiFetchInit, buildRequestInit, parseJsonResponse } from "./request";

export type { ApiFetchInit } from "./request";

/**
 * In-process call into `dispatch()` from a Server Component, Server Action,
 * or Route Handler — no network hop (WIRE-0101, #356). The caller resolves
 * the access token from its own session module (e.g. `getSessionUser()` in
 * `apps/web`) and passes it in; this module never reads cookies itself.
 * Throws `ApiError` for any non-2xx response.
 */
export async function apiFetchServer<T = unknown>(
  path: string,
  init: ApiFetchInit = {},
  accessToken: string | null = null,
): Promise<T> {
  const url = new URL(path, "http://internal");
  const request = new Request(url, buildRequestInit(init, accessToken));
  const response = await dispatch(request);
  if (!response.ok) throw await errorFromResponse(response);
  return parseJsonResponse<T>(response);
}
