import { safeReturnTo } from "@balanse/domain";
import { type NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/modules/session/supabase-server";

/**
 * Starts "Continue with Google" for both log in and sign up. Supabase stores
 * the PKCE verifier in a cookie and returns Google's consent URL; Google
 * then returns to `/auth/callback?returnTo=…`.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const callback = new URL("/auth/callback", origin);
  callback.searchParams.set("returnTo", returnTo);

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callback.toString(), skipBrowserRedirect: true },
  });
  if (error || !data.url) {
    const login = new URL("/login", origin);
    login.searchParams.set("returnTo", returnTo);
    login.searchParams.set("error", "google");
    return NextResponse.redirect(login);
  }
  return NextResponse.redirect(data.url);
}
