import { MOCK_HARNESS_COOKIE, parseMockPrincipal } from "@balanse/mock/session";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { prefetchAdmin } from "@/lib/query/prefetch";
import {
  adminBookingsQuery,
  adminCustomersQuery,
  adminReschedulesQuery,
} from "@/lib/query/queries";
import { RescheduleQueuePage } from "@/modules/admin/ReschedulePages";

export const metadata: Metadata = {
  title: "Reschedules",
  description: "Reschedule requests.",
};

export default async function Page() {
  const principal = parseMockPrincipal((await cookies()).get(MOCK_HARNESS_COOKIE)?.value);
  return prefetchAdmin(
    [
      adminReschedulesQuery(principal.role),
      adminCustomersQuery(principal.role),
      adminBookingsQuery(principal.role),
    ],
    <RescheduleQueuePage />,
  );
}
