import { getMockAdapter } from "@balanse/mock";
import type { Metadata } from "next";
import { BookingForm } from "@/modules/customer/BookingForm";
import { getServerMockPrincipal } from "@/modules/session/server-principal";

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
  const principal = await getServerMockPrincipal();
  const adapter = getMockAdapter();
  const [session, profile, entitlements] = await Promise.all([
    adapter.getPublicSession(sessionId),
    adapter.getMe(principal.customerId),
    adapter.getEligibleEntitlements(principal.customerId, sessionId),
  ]);

  if (!session || !profile) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Reserve your spot</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          That session is not available in this mock.
        </p>
      </section>
    );
  }

  return (
    <BookingForm
      session={session}
      profile={profile}
      entitlements={entitlements}
      intent={intent === "waitlist" ? "waitlist" : "reserve"}
    />
  );
}
