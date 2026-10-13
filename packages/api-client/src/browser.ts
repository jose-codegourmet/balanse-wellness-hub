"use client";

import { createBrowserClient } from "@supabase/ssr";
import { errorFromResponse } from "./errors";
import { type ApiFetchInit, buildRequestInit, parseJsonResponse } from "./request";

export type { ApiFetchInit } from "./request";

let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

/** Lazily-constructed, memoized Supabase browser client (publishable key only). */
export function supabaseBrowserClient() {
  if (cachedClient) return cachedClient;
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error(
      "NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY must be set for the browser Supabase client.",
    );
  }
  cachedClient = createBrowserClient(url, key);
  return cachedClient;
}

async function browserAccessToken(): Promise<string | null> {
  const { data } = await supabaseBrowserClient().auth.getSession();
  return data.session?.access_token ?? null;
}

/**
 * Same-origin `fetch` to `/api/*` from a client component, with the
 * signed-in user's Bearer token attached from the browser Supabase session
 * (WIRE-0101, #356). Throws `ApiError` for any non-2xx response.
 */
export async function apiFetchBrowser<T = unknown>(
  path: string,
  init: ApiFetchInit = {},
): Promise<T> {
  const token = await browserAccessToken();
  const response = await fetch(path, buildRequestInit(init, token));
  if (!response.ok) throw await errorFromResponse(response);
  return parseJsonResponse<T>(response);
}
