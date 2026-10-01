import {
  hasShareParams,
  parseShareParams,
  SHARE_ATTRIBUTION_COOKIE,
  SHARE_ATTRIBUTION_MAX_AGE_DAYS,
  type ShareAttribution,
  type ShareParams,
} from "@balanse/domain";

/**
 * Share attribution cookie (#343, #351).
 *
 * `src/proxy.ts` writes it when a public route is opened with valid `ref`,
 * `src` or `via` params (last touch wins). Sign-up reads it server-side and
 * passes it to `createCustomer`, then clears it. The cookie is HttpOnly, so
 * client code never sees it.
 */

export const SHARE_ATTRIBUTION_MAX_AGE_SECONDS = SHARE_ATTRIBUTION_MAX_AGE_DAYS * 24 * 60 * 60;

export function shareAttributionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SHARE_ATTRIBUTION_MAX_AGE_SECONDS,
  };
}

/** A validated touch from a request's query string, or null when nothing valid is present. */
export function shareAttributionFromSearchParams(
  searchParams: URLSearchParams,
  now: Date = new Date(),
): ShareAttribution | null {
  const params = parseShareParams({
    ref: searchParams.get("ref"),
    src: searchParams.get("src"),
    via: searchParams.get("via"),
  });
  if (!hasShareParams(params)) return null;
  return { ...params, at: now.toISOString() };
}

export function serializeShareAttribution(attribution: ShareAttribution): string {
  const { ref, src, via, at } = attribution;
  return JSON.stringify({ ref, src, via, at });
}

/** Parses and re-validates the cookie. Expired, malformed or empty values return null. */
export function parseShareAttributionCookie(
  raw: string | undefined | null,
  now: number = Date.now(),
): ShareAttribution | null {
  if (!raw) return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const params = parseShareParams({
      ref: typeof value.ref === "string" ? value.ref : null,
      src: typeof value.src === "string" ? value.src : null,
      via: typeof value.via === "string" ? value.via : null,
    });
    const at = typeof value.at === "string" ? value.at : "";
    const touchedAt = Date.parse(at);
    if (!hasShareParams(params) || Number.isNaN(touchedAt)) return null;
    if (now - touchedAt > SHARE_ATTRIBUTION_MAX_AGE_SECONDS * 1000) return null;
    return { ...params, at };
  } catch {
    return null;
  }
}

/** Only the share params, as `createCustomer({ attribution })` expects them. */
export function toShareParams(attribution: ShareAttribution | null): ShareParams | undefined {
  if (!attribution) return undefined;
  const { ref, src, via } = attribution;
  return { ref, src, via };
}

// `next/headers` is imported lazily so `src/proxy.ts` can share the pure
// helpers above without pulling request-scoped APIs into the proxy bundle.
async function cookieStore() {
  const { cookies } = await import("next/headers");
  return cookies();
}

/** Server components, server actions and route handlers. */
export async function readShareAttribution(): Promise<ShareAttribution | null> {
  const store = await cookieStore();
  return parseShareAttributionCookie(store.get(SHARE_ATTRIBUTION_COOKIE)?.value);
}

/** Server actions and route handlers only (cookies are read-only while rendering). */
export async function clearShareAttribution(): Promise<void> {
  const store = await cookieStore();
  store.delete({ name: SHARE_ATTRIBUTION_COOKIE, path: "/" });
}
