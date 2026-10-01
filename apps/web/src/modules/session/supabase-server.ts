import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { requireSupabaseAuthConfig } from "./supabase-config";

/**
 * Cookie-bound Supabase client for server components, server actions and
 * route handlers. Auth state lives in the Supabase session cookies; RLS sees
 * the signed-in user.
 */
export async function createSupabaseServerClient() {
  const store = await cookies();
  const { url, key } = requireSupabaseAuthConfig();
  return createServerClient(url, key, {
    cookies: {
      getAll: () => store.getAll(),
      setAll: (cookiesToSet) => {
        try {
          for (const { name, value, options } of cookiesToSet) store.set(name, value, options);
        } catch {
          // Server components cannot write cookies. `src/proxy.ts` refreshes
          // the session on every request, so this is safe to ignore.
        }
      },
    },
  });
}
