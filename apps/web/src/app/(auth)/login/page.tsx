import type { Metadata } from "next";
import { CustomerLogin } from "@/modules/auth/CustomerLogin";

export const metadata: Metadata = {
  title: "Log in",
  description: "Welcome back to Balansé.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return <CustomerLogin returnTo={returnTo} />;
}
