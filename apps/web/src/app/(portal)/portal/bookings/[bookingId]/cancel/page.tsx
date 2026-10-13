import { getFormPolicies, getMyBooking } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { CancellationRequest } from "./_components/cancellation-request/CancellationRequest";

export const metadata: Metadata = {
  title: "Request cancellation",
  description: "Ask the studio to cancel a reservation.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const profile = await getCurrentCustomer();
  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [booking, policies] = await Promise.all([
    profile ? getMyBooking(fetcher, bookingId, profile.id).catch(() => null) : null,
    getFormPolicies(fetcher, "cancellation")
      .then(({ items }) =>
        items.map((item) => ({
          id: item.id,
          documentName: item.documentName,
          version: item.version,
          promotedAt: "",
          current: true,
          body: item.body,
        })),
      )
      .catch(() => []),
  ]);
  if (!booking) {
    return (
      <section className="mx-auto max-w-3xl px-4 py-12">
        <h1 className="font-display text-3xl">Request cancellation</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t find that booking in your account.
        </p>
      </section>
    );
  }
  return <CancellationRequest booking={booking} policies={policies} />;
}
