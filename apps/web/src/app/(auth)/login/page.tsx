import type { Metadata } from "next";
import { CustomerLogin } from "./_components/customer-login/CustomerLogin";

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
