import "server-only";
import type { createSupabaseServerClient } from "./supabase-server";

/**
 * Signs a `profiles.avatarKey` into a short-lived URL for server-rendered
 * reads (`getSupabaseCustomerProfile`). Uploads and deletes go through the
 * live BE-052 mint/confirm/delete lifecycle (`POST`/`DELETE /api/me/avatar`,
 * WIRE-1103, #362) via `@balanse/api-client`'s `useSaveMyAvatar`/
 * `useDeleteMyAvatar` — this file no longer writes `avatarKey` itself.
 */

const BUCKET = "avatars";
const SIGNED_URL_SECONDS = 60 * 60;

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

/** Short-lived URL for a stored photo, or null when there is none or signing fails. */
export async function signedAvatarUrl(
  supabase: ServerClient,
  key: string | null | undefined,
): Promise<string | null> {
  if (!key) return null;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(key, SIGNED_URL_SECONDS);
  return error ? null : data.signedUrl;
}
