import { getFormPolicies, getPublicSession, listEligiblePackages } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { BookingForm } from "@/modules/customer/BookingForm";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";

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
  const token = await getCustomerAccessToken();
  const fetcher = serverFetcher(token);
  const [sessionResult, entitlements, policyResponse] = await Promise.all([
    getPublicSession(fetcher, sessionId)
      .then((value) => ({ value }))
      .catch(() => ({ value: null })),
    profile
      ? listEligiblePackages(fetcher, sessionId)
          .then((result) => result.items)
          .catch(() => [])
      : [],
    getFormPolicies(fetcher, "booking").catch(() => ({ items: [] })),
  ]);
  const session = sessionResult.value;

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
      policies={policyResponse.items.map((item) => ({
        id: item.id,
        documentName: item.documentName,
        version: item.version,
        promotedAt: "",
        current: true,
        body: item.body,
      }))}
      policyVersionIds={policyResponse.items.map((policy) => policy.id)}
      intent={intent === "waitlist" ? "waitlist" : "reserve"}
    />
  );
}
