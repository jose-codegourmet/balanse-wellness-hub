import { safeReturnTo } from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSupabaseCustomerProfile, isSignUpComplete } from "@/modules/session/current-customer";
import { CustomerSignUp } from "./_components/customer-sign-up/CustomerSignUp";
import { createCustomerAccount } from "./_lib/sign-up-actions";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create a Balansé customer account.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  const signedIn = await getSupabaseCustomerProfile();
  // Members who already finished sign-up have nothing to do here.
  if (signedIn && isSignUpComplete(signedIn)) redirect(safeReturnTo(returnTo));

  const policies = await getMockAdapter().getCustomerFormPolicies("sign_up");
  return (
    <CustomerSignUp
      returnTo={returnTo}
      policies={policies}
      createAccount={createCustomerAccount}
      googleIdentity={
        signedIn
          ? {
              givenName: signedIn.firstName,
              familyName: signedIn.lastName,
              email: signedIn.email,
            }
          : null
      }
    />
  );
}
