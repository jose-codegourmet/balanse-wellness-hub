"use server";

import type {
  CustomerOnboardingAnswers,
  CustomerProfile,
  CustomerProfilePatch,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { removeAvatar, replaceAvatar } from "@/modules/session/avatar-storage";
import {
  ensureProfileRow,
  getCurrentCustomer,
  saveProfileFields,
} from "@/modules/session/current-customer";
import type { ActionResult, OnboardingAnswersPatch } from "./customer-self-service.types";

/**
 * Customer self-service writes (#351, #352). The customer always comes from
 * the Supabase session, never from the caller. Profile fields and onboarding
 * completion are saved to the customer's `profiles` row and to the mock
 * mirror the portal pages read. The profile photo goes to Supabase Storage.
 * Onboarding answers are still mock-only this phase.
 */

async function asCustomer<T>(work: (customerId: string) => Promise<T>): Promise<ActionResult<T>> {
  const profile = await getCurrentCustomer();
  if (!profile) {
    return { ok: false, error: "Sign in to update your profile." };
  }
  try {
    return { ok: true, value: await work(profile.id) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong. Try again.",
    };
  }
}

// Email belongs to the Supabase Auth account and is not editable here.
const PATCH_KEYS = [
  "firstName",
  "lastName",
  "nickname",
  "contactNumber",
  "showOnPublicRoster",
] as const satisfies readonly (keyof CustomerProfilePatch)[];

function pickPatch(patch: CustomerProfilePatch): CustomerProfilePatch {
  const next: Record<string, unknown> = {};
  for (const key of PATCH_KEYS) {
    if (patch[key] !== undefined) next[key] = patch[key];
  }
  return next as CustomerProfilePatch;
}

export async function patchMyProfileAction(
  patch: CustomerProfilePatch,
): Promise<ActionResult<CustomerProfile>> {
  return asCustomer(async (customerId) => {
    const adapter = getMockAdapter();
    const allowed = pickPatch(patch);
    const previous = await adapter.getMe(customerId);
    // The mirror validates the patch first; the database write follows.
    const next = await adapter.patchMe(customerId, allowed);
    try {
      await saveProfileFields(customerId, {
        ...(allowed.firstName !== undefined || allowed.lastName !== undefined
          ? { firstName: next.firstName, lastName: next.lastName }
          : {}),
        contactNumber: allowed.contactNumber === undefined ? undefined : next.contactNumber,
        nickname: allowed.nickname === undefined ? undefined : next.nickname,
        showOnPublicRoster: allowed.showOnPublicRoster,
      });
    } catch (error) {
      if (previous) await adapter.patchMe(customerId, pickPatch(previous));
      throw error;
    }
    return next;
  });
}

export async function setMyAvatarAction(
  avatar: { dataUrl: string } | null,
): Promise<ActionResult<CustomerProfile>> {
  return asCustomer(async (customerId) => {
    await ensureProfileRow();
    const avatarUrl = avatar ? await replaceAvatar(customerId, avatar.dataUrl) : null;
    if (!avatar) await removeAvatar(customerId);
    const profile = await getMockAdapter().getMe(customerId);
    if (!profile) throw new Error("Sign in to update your profile.");
    return { ...profile, avatarUrl };
  });
}

export async function saveMyOnboardingAction(
  patch: OnboardingAnswersPatch,
): Promise<ActionResult<CustomerOnboardingAnswers>> {
  return asCustomer((customerId) => getMockAdapter().saveMyOnboarding(customerId, patch));
}

export async function completeMyOnboardingAction(): Promise<ActionResult<CustomerProfile>> {
  return asCustomer(async (customerId) => {
    await saveProfileFields(customerId, { onboardingCompletedAt: new Date().toISOString() });
    return getMockAdapter().completeOnboarding(customerId);
  });
}

export async function skipMyOnboardingAction(): Promise<ActionResult<CustomerProfile>> {
  return asCustomer(async (customerId) => {
    await saveProfileFields(customerId, { onboardingSkippedAt: new Date().toISOString() });
    return getMockAdapter().skipOnboarding(customerId);
  });
}
