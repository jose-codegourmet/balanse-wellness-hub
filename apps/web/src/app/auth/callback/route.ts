import { safeReturnTo } from "@balanse/domain";
import { type NextRequest, NextResponse } from "next/server";
import { isSignUpComplete, toCustomerProfile } from "@/modules/session/current-customer";
import { createSupabaseServerClient } from "@/modules/session/supabase-server";

/**
 * Supabase redirect target for Google OAuth and email confirmation links.
 * Exchanges the PKCE code for a session cookie, then:
 * - a new account (no contact number yet) finishes sign-up on `/sign-up`;
 * - everyone else continues to `returnTo`.
 */
export async function GET(request: NextRequest) {
  const { origin, searchParams } = request.nextUrl;
  const returnTo = safeReturnTo(searchParams.get("returnTo"));
  const code = searchParams.get("code");

  const failed = () => {
    const login = new URL("/login", origin);
    login.searchParams.set("returnTo", returnTo);
    login.searchParams.set("error", "callback");
    return NextResponse.redirect(login);
  };
  if (!code) return failed();

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return failed();

  const { user } = data;
  const { data: row } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .maybeSingle<Record<string, unknown>>();
  const profile = toCustomerProfile(
    {
      id: user.id,
      email: user.email ?? "",
      meta: user.user_metadata ?? {},
      provider: user.app_metadata?.provider ?? "",
    },
    row ?? null,
  );

  if (!isSignUpComplete(profile)) {
    const signUp = new URL("/sign-up", origin);
    signUp.searchParams.set("returnTo", returnTo);
    return NextResponse.redirect(signUp);
  }
  return NextResponse.redirect(new URL(returnTo, origin));
}
