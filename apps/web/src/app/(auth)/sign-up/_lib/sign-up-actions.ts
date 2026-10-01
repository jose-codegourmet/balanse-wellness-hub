"use server";

import { toPolicyAcceptances } from "@balanse/domain";
import { getMockAdapter, MOCK_NOW_ISO } from "@balanse/mock";
import {
  clearShareAttribution,
  readShareAttribution,
  toShareParams,
} from "@/modules/share/attribution";
import {
  type CustomerSignUpIdentity,
  customerSignUpIdentitySchema,
} from "../_components/customer-sign-up/customer-sign-up-form/CustomerSignUpForm.schema";

export type CreateCustomerAccountResult =
  | { ok: true; customerId: string }
  | { ok: false; error: string };

/**
 * Creates the mock customer on the server (#351). Runs server-side so the
 * HttpOnly share-attribution cookie can be read and cleared, and so the new
 * profile exists for the server-rendered portal (`/portal/welcome`).
 * Policies are re-read here rather than trusted from the browser.
 */
export async function createCustomerAccount(
  input: CustomerSignUpIdentity,
): Promise<CreateCustomerAccountResult> {
  const parsed = customerSignUpIdentitySchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Check your details." };
  }
  const adapter = getMockAdapter();
  try {
    const attribution = await readShareAttribution();
    const profile = await adapter.createCustomer({
      ...parsed.data,
      attribution: toShareParams(attribution),
    });
    const policies = await adapter.getCustomerFormPolicies("sign_up");
    await adapter.acceptPolicies(
      profile.id,
      toPolicyAcceptances(policies, MOCK_NOW_ISO, "sign_up"),
    );
    await clearShareAttribution();
    return { ok: true, customerId: profile.id };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "We couldn't create your account. Try again.",
    };
  }
}
