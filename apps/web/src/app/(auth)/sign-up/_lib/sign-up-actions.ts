"use server";

import { safeReturnTo, toPolicyAcceptances, toReferralChannel } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { headers } from "next/headers";
import {
  getCurrentCustomer,
  getSupabaseCustomerProfile,
  saveProfileFields,
} from "@/modules/session/current-customer";
import { createSupabaseServerClient } from "@/modules/session/supabase-server";
import {
  clearShareAttribution,
  readShareAttribution,
  toShareParams,
} from "@/modules/share/attribution";
import { publicSiteOrigin } from "@/modules/share/site-origin";
import {
  type CustomerSignUpIdentity,
  customerSignUpIdentitySchema,
  PASSWORD_MIN,
} from "../_components/customer-sign-up/customer-sign-up-form/CustomerSignUpForm.schema";
import { welcomePathFor } from "./welcome-path";

export type CustomerSignUpInput = CustomerSignUpIdentity & { password?: string };

export type CreateCustomerAccountResult =
  | { ok: true; next: "welcome" }
  | { ok: true; next: "confirm_email"; email: string }
  | { ok: false; error: string };

/**
 * Creates or finishes a customer account in Supabase Auth (#351).
 *
 * - `email`: `auth.signUp` with the names, contact number and share
 *   attribution (`ref` / `ref_channel`) as user metadata; the
 *   `handle_new_user` trigger turns them into the `profiles` row. With email
 *   confirmation on, the customer confirms through `/auth/callback`.
 * - `google`: the customer is already signed in through Google
 *   (`/auth/callback` sends new accounts here); this saves the checked names
 *   and the contact number to their `profiles` row.
 *
 * Runs server-side so the HttpOnly share-attribution cookie can be read and
 * cleared. Policies are re-read here rather than trusted from the browser;
 * acceptances are still recorded in the mock store this phase.
 */
export async function createCustomerAccount(
  input: CustomerSignUpInput,
  returnTo?: string,
): Promise<CreateCustomerAccountResult> {
  const parsed = customerSignUpIdentitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const identity = parsed.data;
  const adapter = getMockAdapter();
  const policies = await adapter.getCustomerFormPolicies("sign_up");
  const acceptances = toPolicyAcceptances(policies, new Date().toISOString(), "sign_up");

  try {
    if (identity.authMethod === "google") {
      const current = await getSupabaseCustomerProfile();
      if (!current) {
        return { ok: false, error: "Your Google sign-in expired. Continue with Google again." };
      }
      await saveProfileFields(current.id, {
        firstName: identity.firstName,
        lastName: identity.lastName,
        contactNumber: identity.contactNumber,
      });
      // Also on the auth user, so `/auth/callback` sees a finished sign-up even
      // before the `profiles` row is readable (same keys `handle_new_user` reads).
      const supabase = await createSupabaseServerClient();
      const { error: metaError } = await supabase.auth.updateUser({
        data: {
          first_name: identity.firstName,
          last_name: identity.lastName,
          contact_number: identity.contactNumber,
        },
      });
      if (metaError) return { ok: false, error: "We couldn't finish your account. Try again." };
      const mirror = await getCurrentCustomer();
      if (mirror) {
        await adapter.patchMe(mirror.id, {
          firstName: identity.firstName,
          lastName: identity.lastName,
          contactNumber: identity.contactNumber,
        });
      }
      await adapter.acceptPolicies(current.id, acceptances);
      await clearShareAttribution();
      return { ok: true, next: "welcome" };
    }

    const password = input.password ?? "";
    if (password.length < PASSWORD_MIN) {
      return { ok: false, error: `Use at least ${PASSWORD_MIN} characters for your password.` };
    }
    const attribution = toShareParams(await readShareAttribution());
    const channel = attribution ? toReferralChannel(attribution) : null;
    const origin = (await headers()).get("origin") ?? publicSiteOrigin();
    const callback = new URL("/auth/callback", origin);
    callback.searchParams.set("returnTo", welcomePathFor(safeReturnTo(returnTo)));

    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase.auth.signUp({
      email: identity.email,
      password,
      options: {
        emailRedirectTo: callback.toString(),
        data: {
          first_name: identity.firstName,
          last_name: identity.lastName,
          full_name: `${identity.firstName} ${identity.lastName}`.trim(),
          contact_number: identity.contactNumber,
          ...(attribution?.ref ? { ref: attribution.ref } : {}),
          ...(channel ? { ref_channel: channel } : {}),
        },
      },
    });
    if (error) {
      if (error.code === "user_already_exists" || error.code === "email_exists") {
        return { ok: false, error: "An account with this email already exists. Log in instead." };
      }
      if (error.code === "weak_password") {
        return { ok: false, error: "Choose a stronger password." };
      }
      return { ok: false, error: "We couldn't create your account. Try again." };
    }
    if (data.user) await adapter.acceptPolicies(data.user.id, acceptances);
    await clearShareAttribution();
    // No session means Supabase sent a confirmation email first.
    return data.session
      ? { ok: true, next: "welcome" }
      : { ok: true, next: "confirm_email", email: identity.email };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "We couldn't create your account. Try again.",
    };
  }
}
