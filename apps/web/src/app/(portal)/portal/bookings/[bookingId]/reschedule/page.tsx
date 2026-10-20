import { getFormPolicies, getMyBooking } from "@balanse/api-client";
import type { Metadata } from "next";
import { serverFetcher } from "@/lib/query/fetcher";
import { prefetchWeb } from "@/lib/query/prefetch";
import { publicSessionsQuery } from "@/lib/query/sessions";
import { rescheduleRange } from "@/modules/schedule/reschedule-range";
import { getCurrentCustomer, getCustomerAccessToken } from "@/modules/session/current-customer";
import { RescheduleForm } from "./_components/reschedule-form/RescheduleForm";

export const metadata: Metadata = {
  title: "Request reschedule",
  description: "Ask the studio to move a reservation.",
};

export default async function Page({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = await params;
  const profile = await getCurrentCustomer();
  const fetcher = serverFetcher(await getCustomerAccessToken());
  const [booking, policies] = await Promise.all([
    profile ? getMyBooking(fetcher, bookingId, profile.id).catch(() => null) : null,
    getFormPolicies(fetcher, "reschedule")
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
        <h1 className="font-display text-3xl">Request reschedule</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We couldn&apos;t find that booking in your account.
        </p>
      </section>
    );
  }
  // One instant for the request: the prefetch and the client query derive the
  // same rolling window from it (#379).
  const nowIso = new Date().toISOString();
  return prefetchWeb(
    [publicSessionsQuery(rescheduleRange(nowIso), fetcher)],
    <RescheduleForm booking={booking} policies={policies} nowIso={nowIso} />,
  );
}
