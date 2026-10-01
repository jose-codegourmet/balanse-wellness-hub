import { safeReturnTo } from "@balanse/domain";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/modules/session/current-customer";
import { CustomerLogin } from "./_components/customer-login/CustomerLogin";
import { signInWithPassword } from "./_lib/login-actions";

export const metadata: Metadata = {
  title: "Log in",
  description: "Welcome back to Balansé.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  const { returnTo, error } = await searchParams;
  // Already signed in: carry on to where they were going.
  if (await getSessionUser()) redirect(safeReturnTo(returnTo));
  return <CustomerLogin returnTo={returnTo} authError={error} signIn={signInWithPassword} />;
}
