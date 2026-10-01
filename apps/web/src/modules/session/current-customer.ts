import "server-only";
import type { CustomerProfile, OnboardingStatus } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { JwtPayload } from "@supabase/supabase-js";
import { cache } from "react";
import { signedAvatarUrl } from "./avatar-storage";
import { createSupabaseServerClient } from "./supabase-server";

/**
 * Customer identity from Supabase Auth (replaces the mock principal).
 *
 * The signed-in user is the customer: `customerId` is the Supabase user id
 * (`auth.users.id` = `profiles.id`). Identity fields come from the
 * `profiles` row (created by `app_private.handle_new_user`) with the auth
 * claims as fallback. The photo is a signed URL for `profiles.avatarKey` in
 * Supabase Storage (`avatar-storage.ts`). Bookings, packages and onboarding
 * answers are still mocked this phase, so the profile is mirrored into the
 * MockDataAdapter under the same id (`ensureCustomer`).
 */

export type SessionUser = { id: string; email: string };

type ProfileRow = Record<string, unknown>;

async function readClaims(): Promise<JwtPayload | null> {
  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.getClaims();
    if (error || !data?.claims?.sub) return null;
    return data.claims;
  } catch {
    return null;
  }
}

/** Verified JWT claims for this request (cached per render). */
const getClaims = cache(readClaims);

/** The signed-in Supabase user, or null for guests. Cheap: no database read. */
export const getSessionUser = cache(async (): Promise<SessionUser | null> => {
  const claims = await getClaims();
  if (!claims) return null;
  return { id: claims.sub, email: typeof claims.email === "string" ? claims.email : "" };
});

function text(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

function splitFullName(full: string): { first: string; last: string } {
  const [first = "", ...rest] = full.split(/\s+/).filter(Boolean);
  return { first, last: rest.join(" ") };
}

function onboardingStatusOf(row: ProfileRow | null): OnboardingStatus {
  if (row?.onboardingCompletedAt) return "completed";
  if (row?.onboardingSkippedAt) return "skipped";
  return "not_started";
}

/**
 * Maps a `profiles` row plus auth claims to the domain profile. Tolerates
 * both the BE-002 table (`fullName` only) and the #344 columns
 * (`firstName`, `lastName`, `nickname`, …), whichever the project has applied.
 */
export function toCustomerProfile(
  user: { id: string; email: string; meta: Record<string, unknown>; provider: string },
  row: ProfileRow | null,
): CustomerProfile {
  const email = text(row?.email) || user.email;
  let firstName = text(row?.firstName);
  let lastName = text(row?.lastName);
  if (!firstName) {
    const metaFirst = text(user.meta.first_name) || text(user.meta.given_name);
    const metaLast = text(user.meta.last_name) || text(user.meta.family_name);
    const full = text(row?.fullName) || text(user.meta.full_name) || text(user.meta.name);
    if (metaFirst && (!full || `${metaFirst} ${metaLast}`.trim() === full)) {
      firstName = metaFirst;
      lastName = metaLast;
    } else {
      const split = splitFullName(full);
      firstName = split.first || email.split("@")[0] || "Member";
      lastName = split.last;
    }
  }
  return {
    id: user.id,
    firstName,
    lastName,
    fullName: `${firstName} ${lastName}`.trim(),
    nickname: text(row?.nickname) || null,
    avatarUrl: null,
    showOnPublicRoster: row?.showOnPublicRoster !== false,
    referralCode: text(row?.referralCode),
    onboardingStatus: onboardingStatusOf(row),
    email,
    contactNumber: text(row?.contactNumber) || text(user.meta.contact_number),
    authMethod: user.provider === "google" ? "google" : "email",
  };
}

/** The Supabase-backed profile, without touching the mock mirror. */
export const getSupabaseCustomerProfile = cache(async (): Promise<CustomerProfile | null> => {
  const claims = await getClaims();
  if (!claims) return null;
  const supabase = await createSupabaseServerClient();
  const { data: row } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", claims.sub)
    .maybeSingle<ProfileRow>();
  const profile = toCustomerProfile(
    {
      id: claims.sub,
      email: typeof claims.email === "string" ? claims.email : "",
      meta: (claims.user_metadata ?? {}) as Record<string, unknown>,
      provider: text(claims.app_metadata?.provider),
    },
    row ?? null,
  );
  return { ...profile, avatarUrl: await signedAvatarUrl(supabase, text(row?.avatarKey)) };
});

/**
 * The signed-in customer, or null for guests. Seeds the mock mirror on first
 * use; after that the mirror holds this session's still-mocked edits.
 */
export const getCurrentCustomer = cache(async (): Promise<CustomerProfile | null> => {
  const profile = await getSupabaseCustomerProfile();
  if (!profile) return null;
  const mirror = await getMockAdapter().ensureCustomer(profile);
  // The photo always comes from Supabase Storage, never the mock mirror.
  return { ...mirror, avatarUrl: profile.avatarUrl };
});

/**
 * Makes sure the signed-in user has a `profiles` row, creating it from the
 * auth claims when the project has no `handle_new_user` trigger. Writes that
 * target the row (such as `avatarKey`) need it to exist.
 */
export async function ensureProfileRow(): Promise<void> {
  const profile = await getSupabaseCustomerProfile();
  if (!profile) throw new Error("Sign in to update your profile.");
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", profile.id)
    .maybeSingle();
  if (error) throw new Error("We couldn't load your profile. Try again.");
  if (data) return;
  await saveProfileFields(profile.id, {
    firstName: profile.firstName,
    lastName: profile.lastName,
    contactNumber: profile.contactNumber,
  });
}

/** Sign-up is finished once the profile has the required contact number. */
export function isSignUpComplete(profile: Pick<CustomerProfile, "contactNumber">): boolean {
  return profile.contactNumber.length > 0;
}

export type ProfileFields = {
  firstName?: string;
  lastName?: string;
  contactNumber?: string;
  nickname?: string | null;
  showOnPublicRoster?: boolean;
  onboardingCompletedAt?: string;
  onboardingSkippedAt?: string;
};

/**
 * Writes customer-editable columns to the signed-in user's `profiles` row
 * (RLS: own row only). Falls back to the BE-002 columns (`fullName`,
 * `contactNumber`) when the #344 columns are not on the project yet;
 * fields with no BE-002 equivalent are skipped in that case.
 *
 * If the row does not exist (the `handle_new_user` trigger is missing on the
 * project), it is inserted instead; RLS allows a user to insert their own row.
 * An UPDATE that matches no rows is not an error in PostgREST, so the
 * returned ids are checked.
 */
export async function saveProfileFields(userId: string, fields: ProfileFields): Promise<void> {
  const patch = Object.fromEntries(
    Object.entries(fields).filter(([, value]) => value !== undefined),
  );
  if (Object.keys(patch).length === 0) return;
  const supabase = await createSupabaseServerClient();
  const saveFailed = () => new Error("We couldn't save your profile. Try again.");

  const now = new Date().toISOString();
  const modern = await supabase.from("profiles").update(patch).eq("id", userId).select("id");
  if (!modern.error) {
    if (modern.data.length > 0) return;
    const inserted = await supabase.from("profiles").insert({
      id: userId,
      email: await claimEmail(supabase),
      ...patch,
      firstName: fields.firstName ?? (await emailLocalPart(supabase)),
      updatedAt: now,
    });
    if (!inserted.error) return;
    // A pre-#344 table without `firstName`: insert the BE-002 row below instead.
    if (inserted.error.code !== "PGRST204") throw saveFailed();
  } else if (modern.error.code !== "PGRST204") {
    // PGRST204: a column is missing from the schema cache (#344 not applied).
    throw saveFailed();
  }

  const legacy: Record<string, string> = {};
  if (fields.firstName !== undefined) {
    legacy.fullName = `${fields.firstName} ${fields.lastName ?? ""}`.trim();
  }
  if (fields.contactNumber !== undefined) legacy.contactNumber = fields.contactNumber;
  if (Object.keys(legacy).length === 0) return;
  const fallback = await supabase
    .from("profiles")
    .update({ ...legacy, updatedAt: now })
    .eq("id", userId)
    .select("id");
  if (fallback.error) throw saveFailed();
  if (fallback.data.length > 0) return;
  const inserted = await supabase.from("profiles").insert({
    id: userId,
    email: await claimEmail(supabase),
    fullName: legacy.fullName ?? (await emailLocalPart(supabase)),
    contactNumber: legacy.contactNumber ?? "",
    updatedAt: now,
  });
  if (inserted.error) throw saveFailed();
}

type ServerClient = Awaited<ReturnType<typeof createSupabaseServerClient>>;

async function claimEmail(supabase: ServerClient): Promise<string> {
  const { data } = await supabase.auth.getClaims();
  return typeof data?.claims?.email === "string" ? data.claims.email : "";
}

async function emailLocalPart(supabase: ServerClient): Promise<string> {
  return (await claimEmail(supabase)).split("@")[0] || "Member";
}
