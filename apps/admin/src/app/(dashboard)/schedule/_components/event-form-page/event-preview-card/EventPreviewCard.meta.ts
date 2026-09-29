export const eventPreviewCardMeta = {
  purpose:
    "Approximate customer-facing event card that updates live while an admin fills in the event composer.",
  whenToUse:
    "Use beside the event composer (desktop rail) or inside its preview sheet (below xl). Pass already-resolved display strings; the card does not read form state.",
  whenNotToUse:
    "Not the real public event card and not a source of truth for pricing. Session date, time, capacity, and price come from the linked session.",
} as const;

export type EventPreviewCardProps = {
  title: string;
  summary: string;
  /** Displayable image URL (object URL or public path). Null shows the fallback art. */
  posterSrc: string | null;
  /** True when a poster token is set but cannot be shown in this browser. */
  posterPending?: boolean;
  beneficiary: string;
  /** The linked session's venue name. Events do not store their own venue. */
  venueName: string;
  galleryCount: number;
  session: {
    className: string;
    startsAt: string;
    endsAt: string;
    capacity: number;
    priceLabel: string;
  } | null;
  className?: string;
};
