import type { CustomerBooking } from "@balanse/domain";

/**
 * The dedicated customer booking index. It groups every reservation into
 * Upcoming, Pending, and History, and is the full-list destination for the
 * compact attention preview on portal home. Do not use it for a single booking:
 * booking detail owns the status explanation and booking actions.
 */
export type MyBookingsPageProps = {
  bookings: CustomerBooking[];
  /** Optional query-string tab requested by an entry point such as Home. */
  initialTab?: string;
};
