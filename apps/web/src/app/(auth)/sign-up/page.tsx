import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
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
  const policies = await getMockAdapter().getCustomerFormPolicies("sign_up");
  return (
    <CustomerSignUp returnTo={returnTo} policies={policies} createAccount={createCustomerAccount} />
  );
}
