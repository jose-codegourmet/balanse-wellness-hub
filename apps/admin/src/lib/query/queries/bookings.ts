import { type ApiFetcher, listAdminBookings } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { ADMIN_CURSOR_LIMIT_MAX, type StaffAuthorizationActor } from "@balanse/domain";
import { infiniteQueryOptions, queryOptions } from "@tanstack/react-query";
import { adminAuthScope } from "../auth-scope";
import { type AdminBookingListFilters, adminKeys } from "../keys";

/**
 * The cursor route defaults to 8 rows per tab (`ADMIN_BOOKINGS_CURSOR_LIMIT_DEFAULT`)
 * — fine for `adminBookingsInfiniteQuery`'s own paging, but every other
 * consumer here (`BookingPages`, schedule, transactions, events, reschedules)
 * expects the one-shot full-tab list, same as sessions/customers (WIRE-0801,
 * #363). Request the max page size instead of silently showing 8 rows.
 */
export const adminBookingsQuery = (
  actor: StaffAuthorizationActor | null,
  filters?: AdminBookingListFilters,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.bookings.list(scope, filters),
    queryFn: async () =>
      (
        await listAdminBookings(fetcher, {
          tab: filters?.tab,
          q: filters?.query,
          classId: filters?.classId,
          date: filters?.date,
          limit: ADMIN_CURSOR_LIMIT_MAX,
        })
      ).items,
  });
};

/** Cursor queue for booking management; list pages may keep the first page view. */
export const adminBookingsInfiniteQuery = (
  actor: StaffAuthorizationActor | null,
  filters?: AdminBookingListFilters,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return infiniteQueryOptions({
    queryKey: adminKeys.bookings.list(scope, filters),
    initialPageParam: null as string | null,
    queryFn: ({ pageParam }) =>
      listAdminBookings(fetcher, {
        tab: filters?.tab,
        q: filters?.query,
        classId: filters?.classId,
        date: filters?.date,
        cursor: pageParam ?? undefined,
      }),
    getNextPageParam: (page) => page.nextCursor ?? undefined,
  });
};

export const adminBookingDetailQuery = (
  actor: StaffAuthorizationActor | null,
  id: string,
  fetcher: ApiFetcher = apiFetchBrowser,
) => {
  const scope = adminAuthScope(actor);
  return queryOptions({
    queryKey: adminKeys.bookings.detail(scope, id),
    queryFn: async () => {
      const tabs = ["pending", "confirmed", "waitlisted", "expired", "history"];
      const pages = await Promise.all(
        tabs.map((tab) => listAdminBookings(fetcher, { tab, limit: 100 })),
      );
      return pages.flatMap((page) => page.items).find((booking) => booking.id === id) ?? null;
    },
  });
};
