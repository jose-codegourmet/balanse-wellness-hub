/**
 * Supabase Auth configuration for the customer app. Server-side names first
 * (same as the class catalogue), falling back to the public names. Only the
 * publishable key is used here; never a service-role key.
 *
 * No `server-only` import: `src/proxy.ts` shares this file.
 */
export function supabaseAuthConfig(): { url: string; key: string } | null {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key =
    process.env.SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  return url && key ? { url, key } : null;
}

export function requireSupabaseAuthConfig(): { url: string; key: string } {
  const config = supabaseAuthConfig();
  if (!config) {
    throw new Error(
      "Supabase Auth is not configured. Set SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY.",
    );
  }
  return config;
}
