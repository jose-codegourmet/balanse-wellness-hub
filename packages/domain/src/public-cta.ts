/**
 * Public call-to-action and footer catalogs (FE-PUB polish).
 *
 * Every entry here must point at a route that exists in `apps/web`. Nothing in
 * this file may reference coach rates or any other admin-only figure.
 */

import { CONTACT_DETAILS, landingScheduleHref } from "./public-pages";

export type PublicCtaTone = "primary" | "accent" | "quiet";

export type PublicCtaAction = {
  id: string;
  label: string;
  href: string;
  tone: PublicCtaTone;
  /** External destinations open in a new tab and need rel hardening. */
  external?: boolean;
  description?: string;
};

export type PublicCtaBlock = {
  id: PublicCtaBlockId;
  eyebrow: string;
  title: string;
  body: string;
  actions: readonly PublicCtaAction[];
  /** Manifest slot used as the band background, when the page has one. */
  assetId?: string;
};

export type PublicCtaBlockId =
  | "landing-mid"
  | "landing-final"
  | "about-band"
  | "about-final"
  | "faqs-final"
  | "coaches-final";

export const SCHEDULE_HREF = landingScheduleHref();
export const CLASSES_HREF = "/#classes";

/** The one action every public page repeats. Keep the wording identical everywhere. */
export const PRIMARY_SCHEDULE_ACTION: PublicCtaAction = {
  id: "schedule",
  label: "View the schedule",
  href: SCHEDULE_HREF,
  tone: "primary",
};

export const CREATE_ACCOUNT_ACTION: PublicCtaAction = {
  id: "sign-up",
  label: "Create an account",
  href: "/sign-up",
  tone: "accent",
};

export const LOGIN_ACTION: PublicCtaAction = {
  id: "login",
  label: "Log in",
  href: "/login",
  tone: "quiet",
};

export const CONTACT_ACTION: PublicCtaAction = {
  id: "contact",
  label: "Contact the studio",
  href: "/contact",
  tone: "quiet",
};

export const COACHES_ACTION: PublicCtaAction = {
  id: "coaches",
  label: "Meet the coaches",
  href: "/coaches",
  tone: "quiet",
};

export const PUBLIC_CTA_BLOCKS: Readonly<Record<PublicCtaBlockId, PublicCtaBlock>> = {
  "landing-mid": {
    id: "landing-mid",
    eyebrow: "Come train with us",
    title: "One studio, every kind of movement.",
    body: "Yoga, pilates, calisthenics, kickboxing, capoeira, and dance run out of the same room in Cebu City.",
    actions: [PRIMARY_SCHEDULE_ACTION, COACHES_ACTION],
    assetId: "landing-e",
  },
  "landing-final": {
    id: "landing-final",
    eyebrow: "Ready when you are",
    title: "Pick a class. Keep your balance.",
    body: "Browse the week, reserve a spot, then pay by GCash or at the counter. An admin confirms every booking.",
    actions: [PRIMARY_SCHEDULE_ACTION, CREATE_ACCOUNT_ACTION],
    assetId: "landing-d",
  },
  "about-band": {
    id: "about-band",
    eyebrow: "Movement · Wellness · Community",
    title: "A room built for the long haul.",
    body: "Training, recovery, and community share one space, so the habit is easier to keep than to start over.",
    actions: [PRIMARY_SCHEDULE_ACTION, CONTACT_ACTION],
    assetId: "about-d",
  },
  "about-final": {
    id: "about-final",
    eyebrow: "Movement · Wellness · Community",
    title: "See what is running this week.",
    body: "The calendar is the whole booking path — no phone tag, no separate walk-in desk.",
    actions: [PRIMARY_SCHEDULE_ACTION, COACHES_ACTION],
    assetId: "about-c",
  },
  "faqs-final": {
    id: "faqs-final",
    eyebrow: "Still deciding?",
    title: "Ask us, or just look at the week.",
    body: "The studio answers questions on the contact page. Reservations always happen on the calendar.",
    actions: [CONTACT_ACTION, PRIMARY_SCHEDULE_ACTION],
  },
  "coaches-final": {
    id: "coaches-final",
    eyebrow: "Train with them",
    title: "Find your coach on the calendar.",
    body: "Every coach teaches published sessions. Filter the week by coach and reserve the one that fits.",
    actions: [PRIMARY_SCHEDULE_ACTION, CONTACT_ACTION],
  },
} as const;

export function publicCtaBlock(id: PublicCtaBlockId): PublicCtaBlock {
  return PUBLIC_CTA_BLOCKS[id];
}

export type PublicFooterLink = {
  label: string;
  href: string;
  external?: boolean;
};

export type PublicFooterColumn = {
  id: "explore" | "studio" | "account";
  title: string;
  links: readonly PublicFooterLink[];
};

export const PUBLIC_FOOTER_COLUMNS: readonly PublicFooterColumn[] = [
  {
    id: "explore",
    title: "Explore",
    links: [
      { label: "Schedule", href: SCHEDULE_HREF },
      { label: "Classes", href: CLASSES_HREF },
      { label: "Coaches", href: "/coaches" },
    ],
  },
  {
    id: "studio",
    title: "Studio",
    links: [
      { label: "About", href: "/about" },
      { label: "FAQs", href: "/faqs" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    id: "account",
    title: "Account",
    links: [
      { label: "Log in", href: "/login" },
      { label: "Create an account", href: "/sign-up" },
      { label: "Reset password", href: "/forgot-password" },
    ],
  },
] as const;

export type PublicSocialLink = {
  id: "instagram" | "tiktok" | "messenger" | "whatsapp";
  label: string;
  handle: string;
  href: string;
};

export const PUBLIC_SOCIAL_LINKS: readonly PublicSocialLink[] = [
  {
    id: "instagram",
    label: "Instagram",
    handle: CONTACT_DETAILS.instagram,
    href: CONTACT_DETAILS.instagramHref,
  },
  {
    id: "tiktok",
    label: "TikTok",
    handle: CONTACT_DETAILS.tiktok,
    href: CONTACT_DETAILS.tiktokHref,
  },
  {
    id: "messenger",
    label: "Messenger",
    handle: CONTACT_DETAILS.messenger,
    href: CONTACT_DETAILS.messengerHref,
  },
  {
    id: "whatsapp",
    label: "WhatsApp",
    handle: CONTACT_DETAILS.whatsapp,
    href: CONTACT_DETAILS.whatsappHref,
  },
] as const;

/** Contact channels are informational; the footer must not imply a second booking path. */
export const PUBLIC_FOOTER_NOTE =
  "Reservations happen on the studio calendar. Messages and calls are for questions, not bookings." as const;

export const PUBLIC_FOOTER_LOCATION = "Cebu City, Philippines" as const;

export function publicFooterYear(now: Date = new Date()): number {
  return now.getUTCFullYear();
}

/** Every href a public surface may render, used by the dead-link guard test. */
export function publicCtaHrefs(): string[] {
  const fromBlocks = Object.values(PUBLIC_CTA_BLOCKS).flatMap((block) =>
    block.actions.map((action) => action.href),
  );
  const fromFooter = PUBLIC_FOOTER_COLUMNS.flatMap((column) =>
    column.links.map((link) => link.href),
  );
  return [...new Set([...fromBlocks, ...fromFooter])];
}
