/**
 * Responsive public/customer class calendar and session booking dialog.
 * Uses ScheduleCalendarProps; navigation and reservations stay with the caller.
 *
 * Session details show the title, time, description, all coaches, duration and price.
 * Coaches share a compact two-column roster with photos or initials and wrapping
 * names. A single coach spans the row. There is no per-coach role label or divider.
 * Details scroll inside the viewport-bounded dialog while availability, booking
 * actions and the public details/share links remain accessible in its footer.
 *
 * Use for schedule discovery and the customer's calendar. Do not use for editing
 * sessions or exposing staff-only coach compensation.
 */
export const BalanseBookingCalendarMeta = {
  name: "BalanseBookingCalendar",
  category: "booking",
} as const;
