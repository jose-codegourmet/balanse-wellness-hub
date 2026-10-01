import { SHARE_ATTRIBUTION_COOKIE } from "@balanse/domain";
import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAuthConfig } from "@/modules/session/supabase-config";
import {
  serializeShareAttribution,
  shareAttributionCookieOptions,
  shareAttributionFromSearchParams,
} from "@/modules/share/attribution";

/** Routes that never capture share attribution. */
const NO_ATTRIBUTION = /^\/(portal|dev|auth)(\/|$)/;

/**
 * 1. Supabase session refresh: verifies the auth cookie and rewrites it when
 *    the access token was refreshed, so server components see a valid session.
 * 2. Portal guard: guests opening `/portal/**` go to `/login?returnTo=…`.
 * 3. Share attribution capture (#351). A public page opened with valid `ref`,
 *    `src` or `via` params stores them in the first-party attribution cookie
 *    (last touch wins, 30 days). Invalid values are dropped silently and the
 *    query string is left intact, so pages can still read the params.
 */
export async function proxy(request: NextRequest) {
  let response = NextResponse.next({ request });
  let signedIn = false;

  const config = supabaseAuthConfig();
  if (config) {
    const supabase = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet, headers) => {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
          for (const [key, value] of Object.entries(headers ?? {})) {
            response.headers.set(key, value);
          }
        },
      },
    });
    // Do not run code between client creation and getClaims (Supabase SSR guidance).
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims?.sub);
  }

  const { pathname, search, searchParams } = request.nextUrl;

  if (!signedIn && /^\/portal(\/|$)/.test(pathname)) {
    const login = request.nextUrl.clone();
    login.pathname = "/login";
    login.search = `?returnTo=${encodeURIComponent(`${pathname}${search}`)}`;
    const redirect = NextResponse.redirect(login);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  if (!NO_ATTRIBUTION.test(pathname)) {
    const touch = shareAttributionFromSearchParams(searchParams);
    if (touch) {
      response.cookies.set(
        SHARE_ATTRIBUTION_COOKIE,
        serializeShareAttribution(touch),
        shareAttributionCookieOptions(),
      );
    }
  }
  return response;
}

// Every page request except the API (bearer tokens), share image renderers,
// Next internals and static files. Matcher values must be literals.
export const config = {
  matcher: ["/((?!api|share|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
