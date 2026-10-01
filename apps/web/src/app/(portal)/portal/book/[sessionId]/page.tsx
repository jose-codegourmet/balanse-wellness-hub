import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { BookingForm } from "@/modules/customer/BookingForm";
import { getCurrentCustomer } from "@/modules/session/current-customer";

export const metadata: Metadata = {
  title: "Reserve your spot",
  description: "Confirm a Balansé class reservation.",
};

export default async function Page({
  params,
  searchParams,
}: {
  params: Promise<{ sessionId: string }>;
  searchParams: Promise<{ intent?: string }>;
}) {
  const { sessionId } = await params;
  const { intent } = await searchParams;
  const profile = await getCurrentCustomer();
  const adapter = getMockAdapter();
  const [session, entitlements, policies] = await Promise.all([
    adapter.getPublicSession(sessionId),
    profile ? adapter.getEligibleEntitlements(profile.id, sessionId) : [],
    adapter.getCustomerFormPolicies("booking"),
  ]);

  if (!session || !profile) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Reserve your spot</h1>
        <p className="mt-3 text-sm text-muted-foreground">That session is not available.</p>
      </section>
    );
  }

  return (
    <BookingForm
      session={session}
      profile={profile}
      entitlements={entitlements}
      policies={policies}
      intent={intent === "waitlist" ? "waitlist" : "reserve"}
    />
  );
}
