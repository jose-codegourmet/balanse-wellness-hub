import "server-only";

import {
  type BookingStatus,
  buildPublicEventPath,
  buildPublicSessionPath,
  type CustomerBooking,
  type CustomerProfile,
  formatSessionDate,
  formatSessionTimeRange,
  type ShareParams,
  sessionDisplayName,
  slugify,
  toManilaDateSegment,
  withShareParams,
} from "@balanse/domain";
import { getMockAdapter } from "@balanse/mock";
import { getCurrentCustomer } from "@/modules/session/current-customer";
import { publicSiteOrigin } from "@/modules/share/site-origin";

/** Bookings that mean "you already have a place (or a pending one) in this session". */
const ACTIVE_BOOKING_STATUSES = new Set<BookingStatus>([
  "WAITLISTED",
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
  "CONFIRMED",
  "CANCELLATION_REQUESTED",
  "RESCHEDULE_REQUESTED",
  "CHECKED_IN",
  "COMPLETED",
]);

export type PublicViewerContext = {
  /** Signed-in customer, or null for guests (and staff, who see counts only). */
  viewer: { customerId: string } | null;
  /** Share attribution for links this viewer creates. */
  shareParams: ShareParams;
  existingBookingId: string | null;
};

export async function getPublicViewerContext(sessionId: string): Promise<PublicViewerContext> {
  const profile = await getCurrentCustomer();
  if (!profile) return { viewer: null, shareParams: {}, existingBookingId: null };
  const bookings = await getMockAdapter().getBookings(profile.id);
  const existing = bookings.find(
    (booking) => booking.sessionId === sessionId && ACTIVE_BOOKING_STATUSES.has(booking.status),
  );
  return {
    viewer: { customerId: profile.id },
    // No code until the #344 profile columns exist on the project.
    shareParams: profile.referralCode ? { ref: profile.referralCode, src: "customer" } : {},
    existingBookingId: existing?.id ?? null,
  };
}

export function siteOrigin(): string {
  return publicSiteOrigin();
}

/** Absolute canonical URL with this viewer's share params. */
export function shareUrlFor(path: string, params: ShareParams): string {
  return withShareParams(`${siteOrigin()}${path}`, params);
}

/** Keeps `ref` / `src` / `via` (and anything else) across canonical redirects. */
export function withQuery(
  path: string,
  searchParams: Record<string, string | string[] | undefined>,
) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (typeof value === "string") query.set(key, value);
    else if (Array.isArray(value)) for (const item of value) query.append(key, item);
  }
  const search = query.toString();
  return search ? `${path}?${search}` : path;
}

const INVITABLE_STATUSES = new Set<BookingStatus>([
  "CONFIRMED",
  "HELD_AWAITING_PAYMENT",
  "PAYMENT_SUBMITTED",
]);

/**
 * "Invite friends" payload for an upcoming active booking (#350): the event
 * page when the session has a published event, else the session page, with
 * the customer's `ref` + `src=customer`.
 */
export async function buildBookingInvite(
  booking: CustomerBooking,
  profile: Pick<CustomerProfile, "referralCode"> | null,
) {
  if (!profile || !INVITABLE_STATUSES.has(booking.status)) return null;
  const page = await getMockAdapter().getPublicSessionPage(booking.sessionId);
  if (!page || page.availability === "past" || page.availability === "cancelled") return null;
  const params: ShareParams = { ref: profile.referralCode, src: "customer" };
  const event = page.event?.status === "PUBLISHED" ? page.event : null;
  const path = event
    ? buildPublicEventPath({ title: event.title, startsAt: page.startsAt, id: event.id })
    : buildPublicSessionPath(page);
  const posterPath = event
    ? `/share/poster/events/${encodeURIComponent(event.id)}`
    : `/share/poster/sessions/${encodeURIComponent(page.id)}`;
  const title = event?.title ?? sessionDisplayName(page);
  return {
    url: shareUrlFor(path, params),
    posterUrl: withShareParams(posterPath, params),
    fileSlug: `${slugify(event?.title ?? page.classSlug)}-${toManilaDateSegment(page.startsAt)}`,
    title,
    subtitle: `${formatSessionDate(page.startsAt)} · ${formatSessionTimeRange(page.startsAt, page.endsAt)}`,
    dateLabel: formatSessionDate(page.startsAt),
  };
}
