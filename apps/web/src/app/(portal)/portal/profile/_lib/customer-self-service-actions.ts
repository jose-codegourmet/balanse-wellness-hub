"use server";

import type {
  CustomerOnboardingAnswers,
  CustomerProfile,
  CustomerProfilePatch,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { getServerMockPrincipal } from "@/modules/session/server-principal";
import type { ActionResult, OnboardingAnswersPatch } from "./customer-self-service.types";

/**
 * Customer self-service writes (#351, #352). They run on the server against
 * the same `getMockAdapter()` store the portal pages read, so a saved name,
 * photo, roster choice or onboarding answer shows up on the next server
 * render (portal header, home nudge, booking prefill, wizard resume).
 * The customer always comes from the session, never from the caller.
 */

async function asCustomer<T>(work: (customerId: string) => Promise<T>): Promise<ActionResult<T>> {
  const principal = await getServerMockPrincipal();
  if (principal.role !== "customer") {
    return { ok: false, error: "Sign in to update your profile." };
  }
  try {
    return { ok: true, value: await work(principal.customerId) };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "Something went wrong. Try again.",
    };
  }
}

const PATCH_KEYS = [
  "firstName",
  "lastName",
  "nickname",
  "email",
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
  return asCustomer((customerId) => getMockAdapter().patchMe(customerId, pickPatch(patch)));
}

export async function setMyAvatarAction(
  avatar: { dataUrl: string } | null,
): Promise<ActionResult<CustomerProfile>> {
  return asCustomer((customerId) =>
    getMockAdapter().setMyAvatar(customerId, avatar ? { dataUrl: avatar.dataUrl } : null),
  );
}

export async function saveMyOnboardingAction(
  patch: OnboardingAnswersPatch,
): Promise<ActionResult<CustomerOnboardingAnswers>> {
  return asCustomer((customerId) => getMockAdapter().saveMyOnboarding(customerId, patch));
}

export async function completeMyOnboardingAction(): Promise<ActionResult<CustomerProfile>> {
  return asCustomer((customerId) => getMockAdapter().completeOnboarding(customerId));
}

export async function skipMyOnboardingAction(): Promise<ActionResult<CustomerProfile>> {
  return asCustomer((customerId) => getMockAdapter().skipOnboarding(customerId));
}
