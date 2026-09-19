import type { Metadata } from "next";
import { CustomerSignUp } from "@/modules/auth/CustomerSignUp";

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
  return <CustomerSignUp returnTo={returnTo} />;
}
