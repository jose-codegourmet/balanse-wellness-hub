import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminLogin } from "@/modules/admin/AdminLogin";

export const metadata: Metadata = {
  title: "Log in",
  description: "Balansé Admin sign in.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string }>;
}) {
  const { returnTo } = await searchParams;
  return (
    <Suspense>
      <AdminLogin returnTo={returnTo} />
    </Suspense>
  );
}
