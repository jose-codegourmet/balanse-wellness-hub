import {
  type ApiFetcher,
  getMyBooking,
  getPublicSession,
  listEligiblePackages,
  listMyBookings,
} from "@balanse/api-client";
import { queryOptions } from "@tanstack/react-query";
import { webKeys } from "./keys";
export const myBookingsQuery = (customerId: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.bookings.list(customerId),
    queryFn: () => listMyBookings(fetcher, customerId),
  });
export const myBookingQuery = (customerId: string, id: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.bookings.detail(customerId, id),
    queryFn: () => getMyBooking(fetcher, id, customerId),
  });
export const eligiblePackagesQuery = (customerId: string, sessionId: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.bookings.eligiblePackages(customerId, sessionId),
    queryFn: async () => (await listEligiblePackages(fetcher, sessionId)).items,
  });
/** WIRE-0407 extends this shared public session query. */
export const publicSessionQuery = (id: string, fetcher: ApiFetcher) =>
  queryOptions({
    queryKey: webKeys.publicSession(id),
    queryFn: () => getPublicSession(fetcher, id),
  });
