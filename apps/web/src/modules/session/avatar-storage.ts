import "server-only";
import { randomUUID } from "node:crypto";
import {
  AVATAR_MAX_BYTES,
  AVATAR_VALIDATION_COPY,
  type AvatarMimeType,
  isAvatarMimeType,
} from "@balanse/domain";
import { createSupabaseServerClient } from "./supabase-server";

/**
 * Customer profile photos in Supabase Storage (#344 design).
 *
 * - Private `avatars` bucket; object key `avatars/<userId>/<uuid>.<ext>`,
 *   stored in `profiles.avatarKey` (a DB check enforces the owner prefix).
 * - Uploads and deletes run as the signed-in user, so Storage RLS limits
 *   them to their own folder. No service-role key.
 * - Photos are served only through short-lived signed URLs.
 *
 * Schema: `supabase/migrations/20261001130000_profile_avatar_storage.sql`.
 */

const BUCKET = "avatars";
const SIGNED_URL_SECONDS = 60 * 60;
const EXTENSIONS: Record<AvatarMimeType, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const DATA_URL_RE = /^data:([a-z/+-]+);base64,([A-Za-z0-9+/=]+)$/;
const NOT_SET_UP = "Profile photos aren't set up on the database yet.";

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

async function currentAvatarKey(supabase: ServerClient, userId: string): Promise<string | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("avatarKey")
    .eq("id", userId)
    .maybeSingle<{ avatarKey: string | null }>();
  // 42703: column missing (migration not applied).
  if (error)
    throw new Error(error.code === "42703" ? NOT_SET_UP : "We couldn't update your photo.");
  return data?.avatarKey ?? null;
}

async function setAvatarKey(supabase: ServerClient, userId: string, key: string | null) {
  const { data, error } = await supabase
    .from("profiles")
    .update({ avatarKey: key })
    .eq("id", userId)
    .select("id");
  if (error || data.length === 0) throw new Error("We couldn't update your photo. Try again.");
}

/**
 * Uploads the cropped photo (data URL from `AvatarUploader`), points the
 * profile at it and deletes the previous photo. Returns its signed URL.
 */
export async function replaceAvatar(userId: string, dataUrl: string): Promise<string | null> {
  const match = DATA_URL_RE.exec(dataUrl);
  const mime = match?.[1] ?? "";
  if (!match || !isAvatarMimeType(mime)) throw new Error(AVATAR_VALIDATION_COPY.type);
  const bytes = Buffer.from(match[2] ?? "", "base64");
  if (bytes.byteLength === 0) throw new Error(AVATAR_VALIDATION_COPY.type);
  if (bytes.byteLength > AVATAR_MAX_BYTES) throw new Error(AVATAR_VALIDATION_COPY.size);

  const supabase = await createSupabaseServerClient();
  const previous = await currentAvatarKey(supabase, userId);
  const key = `avatars/${userId}/${randomUUID()}.${EXTENSIONS[mime]}`;
  const upload = await supabase.storage
    .from(BUCKET)
    .upload(key, bytes, { contentType: mime, upsert: false, cacheControl: "3600" });
  if (upload.error) {
    throw new Error(
      /bucket not found/i.test(upload.error.message)
        ? NOT_SET_UP
        : "We couldn't upload your photo. Try again.",
    );
  }
  try {
    await setAvatarKey(supabase, userId, key);
  } catch (error) {
    await supabase.storage.from(BUCKET).remove([key]);
    throw error;
  }
  // Best effort: an orphaned old photo is harmless and stays private.
  if (previous) await supabase.storage.from(BUCKET).remove([previous]);
  return signedAvatarUrl(supabase, key);
}

/** Clears the profile photo and deletes the stored object. */
export async function removeAvatar(userId: string): Promise<void> {
  const supabase = await createSupabaseServerClient();
  const previous = await currentAvatarKey(supabase, userId);
  if (!previous) return;
  await setAvatarKey(supabase, userId, null);
  await supabase.storage.from(BUCKET).remove([previous]);
}
