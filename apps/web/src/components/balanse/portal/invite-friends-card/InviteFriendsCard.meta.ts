/**
 * # InviteFriendsCard (#350)
 *
 * Booking detail card: "Bring a friend to <class> on <date>" with the share
 * dialog. The route builds `invite` server-side (it needs the class slug and
 * any published event): the URL points at the public event page when the
 * session has a published event, otherwise the public session page, and
 * carries the customer's `ref` + `src=customer`.
 *
 * Show only for upcoming bookings in CONFIRMED, HELD_AWAITING_PAYMENT, or
 * PAYMENT_SUBMITTED. Hidden for cancelled, rejected, expired, and past.
 */
export type InviteFriendsCardProps = {
  invite: {
    url: string;
    posterUrl?: string;
    fileSlug: string;
    title: string;
    subtitle: string;
    dateLabel: string;
  };
};

export const inviteFriendsCardMeta = {
  purpose: "Invite friends to an upcoming booked session via link, QR, or poster.",
  whenToUse: "Portal booking detail for upcoming active bookings.",
  whenNotToUse: "Public pages (they have their own share button).",
} as const;
