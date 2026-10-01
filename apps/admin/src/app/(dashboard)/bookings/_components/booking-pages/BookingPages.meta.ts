/**
 * Booking list and detail screens. The list combines booking-status tabs,
 * class selection, and the shared DateRangePicker for an inclusive range of
 * session dates. Clearing the range shows every date. The detail route keeps
 * booking and payment review actions behind shared admin permissions.
 */
export type BookingPagesMeta = {
  listRoute: "/bookings";
  detailRoute: "/bookings/[bookingId]";
};
