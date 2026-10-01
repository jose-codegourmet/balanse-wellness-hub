import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/modules/session/supabase-server";

/**
 * Ends the Supabase session for this browser and clears the auth cookies.
 * POST only, so a link or prefetch can never log someone out.
 */
export async function POST() {
  const supabase = await createSupabaseServerClient();
  // An expired or already-revoked session still clears the local cookies, so
  // the browser always ends up signed out.
  await supabase.auth.signOut({ scope: "local" });
  return NextResponse.json({ ok: true });
}
