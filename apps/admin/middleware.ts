import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import { supabaseAuthConfig } from "@/modules/session/supabase-config";

/**
 * Supabase session refresh (WIRE-0201, #357, replaces the mock-principal
 * cookie guard): verifies the auth cookie and rewrites it when the access
 * token was refreshed, so server components see a valid session. Guests
 * outside `/login`/`/dev` go to `/login?returnTo=…`. A signed-in user
 * opening `/login` is sent to `/dashboard` — `AdminGuard` (which already
 * resolves the full staff actor) decides from there whether that lands on
 * the dashboard or an access-denied/revoked screen for a non-staff or
 * inactive account.
 */
export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });
  let signedIn = false;

  const config = supabaseAuthConfig();
  if (config) {
    const supabase = createServerClient(config.url, config.key, {
      cookies: {
        getAll: () => request.cookies.getAll(),
        setAll: (cookiesToSet) => {
          for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });
    // Do not run code between client creation and getClaims (Supabase SSR guidance).
    const { data } = await supabase.auth.getClaims();
    signedIn = Boolean(data?.claims?.sub);
  }

  const isLogin = request.nextUrl.pathname.startsWith("/login");
  const isDev = request.nextUrl.pathname.startsWith("/dev");
  const isStaffInvite = request.nextUrl.pathname === "/auth/set-password";

  if (!signedIn && !isLogin && !isDev && !isStaffInvite) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("returnTo", request.nextUrl.pathname);
    const redirect = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  if (signedIn && isLogin) {
    const url = request.nextUrl.clone();
    url.pathname = "/dashboard";
    url.search = "";
    const redirect = NextResponse.redirect(url);
    for (const cookie of response.cookies.getAll()) redirect.cookies.set(cookie);
    return redirect;
  }

  response.headers.set("X-Robots-Tag", "noindex, nofollow, noarchive");
  if (isStaffInvite) {
    response.headers.set("Cache-Control", "no-store");
    response.headers.set("Referrer-Policy", "no-referrer");
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
