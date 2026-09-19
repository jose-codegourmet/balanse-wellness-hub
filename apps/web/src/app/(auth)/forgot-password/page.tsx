import type { Metadata } from "next";
import {
  CustomerForgotPassword,
  type ForgotPasswordView,
} from "@/modules/auth/CustomerForgotPassword";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset a Balansé customer password.",
};

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ state?: string }>;
}) {
  const { state } = await searchParams;
  const view: ForgotPasswordView | undefined =
    state === "expired" || state === "submitted" || state === "invalid" ? state : undefined;
  return <CustomerForgotPassword forcedView={view} />;
}
