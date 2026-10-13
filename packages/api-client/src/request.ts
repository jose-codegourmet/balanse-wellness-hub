/** Shared, transport-agnostic request building for the browser/server `apiFetch*` variants. */

export type ApiFetchInit = Omit<RequestInit, "body"> & { body?: unknown };

export function buildRequestInit(init: ApiFetchInit, accessToken: string | null): RequestInit {
  const headers = new Headers(init.headers);
  headers.set("accept", "application/json");
  if (accessToken) headers.set("authorization", `Bearer ${accessToken}`);
  let body: BodyInit | undefined;
  if (init.body !== undefined) {
    headers.set("content-type", "application/json");
    body = JSON.stringify(init.body);
  }
  return { ...init, headers, body };
}

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  if (response.status === 204) return undefined as T;
  const text = await response.text();
  if (!text) return undefined as T;
  return JSON.parse(text) as T;
}
