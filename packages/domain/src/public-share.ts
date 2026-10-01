/**
 * Shareable public session/event pages (#343).
 *
 * URLs: `/sessions/<class-slug>/<YYYY-MM-DD>/<sessionId>` and
 * `/events/<event-title-slug>/<YYYY-MM-DD>/<eventId>`. The date is the
 * session start in Asia/Manila. The id is authoritative; a stale slug or date
 * redirects to the canonical path. Event slugs are derived from the title at
 * render time — nothing is stored.
 */
import type { EventStatus, SessionStatus } from "./enums";
import { manilaYmd } from "./format";
import type { ReferralChannel } from "./onboarding";
import type { PublicCoach, PublicSession } from "./types";

const SLUG_MAX = 60;

export function slugify(text: string, fallback = "page"): string {
  const slug = text
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, SLUG_MAX)
    .replace(/-+$/g, "");
  return slug || fallback;
}

export function toManilaDateSegment(iso: string): string {
  return manilaYmd(iso);
}

export function buildPublicSessionPath(session: {
  classSlug: string;
  startsAt: string;
  id: string;
}): string {
  return `/sessions/${slugify(session.classSlug, "session")}/${toManilaDateSegment(
    session.startsAt,
  )}/${encodeURIComponent(session.id)}`;
}

export function buildPublicEventPath(event: {
  title: string;
  startsAt: string;
  id: string;
}): string {
  return `/events/${slugify(event.title, "event")}/${toManilaDateSegment(
    event.startsAt,
  )}/${encodeURIComponent(event.id)}`;
}

export function isCanonicalSessionPath(
  params: { classSlug: string; date: string },
  session: { classSlug: string; startsAt: string },
): boolean {
  return (
    params.classSlug === slugify(session.classSlug, "session") &&
    params.date === toManilaDateSegment(session.startsAt)
  );
}

export function isCanonicalEventPath(
  params: { eventSlug: string; date: string },
  event: { title: string; startsAt: string },
): boolean {
  return (
    params.eventSlug === slugify(event.title, "event") &&
    params.date === toManilaDateSegment(event.startsAt)
  );
}

export const SHARE_SOURCES = ["customer", "studio"] as const;
export type ShareSource = (typeof SHARE_SOURCES)[number];
export const SHARE_VIAS = ["link", "qr"] as const;
export type ShareVia = (typeof SHARE_VIAS)[number];

export type ShareParams = { ref?: string | null; src?: ShareSource | null; via?: ShareVia | null };

export const REFERRAL_CODE_PATTERN = /^[A-Za-z0-9]{6,16}$/;

/** Adds share attribution params to an absolute or relative URL. `via=link` is implied. */
export function withShareParams(url: string, params: ShareParams): string {
  const isAbsolute = /^https?:\/\//i.test(url);
  const parsed = new URL(url, "http://placeholder.local");
  if (params.ref && REFERRAL_CODE_PATTERN.test(params.ref)) {
    parsed.searchParams.set("ref", params.ref);
  }
  if (params.src) parsed.searchParams.set("src", params.src);
  if (params.via === "qr") parsed.searchParams.set("via", "qr");
  else parsed.searchParams.delete("via");
  if (isAbsolute) return parsed.toString();
  return `${parsed.pathname}${parsed.search}${parsed.hash}`;
}

/** Validated attribution from query params or the attribution cookie. Invalid parts drop. */
export function parseShareParams(input: {
  ref?: string | null;
  src?: string | null;
  via?: string | null;
}): ShareParams {
  const out: ShareParams = {};
  if (input.ref && REFERRAL_CODE_PATTERN.test(input.ref)) out.ref = input.ref;
  if (input.src && (SHARE_SOURCES as readonly string[]).includes(input.src)) {
    out.src = input.src as ShareSource;
  }
  if (input.via && (SHARE_VIAS as readonly string[]).includes(input.via)) {
    out.via = input.via as ShareVia;
  }
  return out;
}

export function hasShareParams(params: ShareParams): boolean {
  return Boolean(params.ref || params.src || params.via);
}

/**
 * Referral channel recorded at sign-up. A `ref` means a customer shared it;
 * `src=studio` without a ref means studio marketing. Nothing else counts.
 */
export function toReferralChannel(params: ShareParams): ReferralChannel | null {
  const qr = params.via === "qr";
  if (params.ref) return qr ? "CUSTOMER_QR" : "CUSTOMER_LINK";
  if (params.src === "studio") return qr ? "STUDIO_QR" : "STUDIO_LINK";
  return null;
}

export const SHARE_ATTRIBUTION_COOKIE = "balanse_share_attr";
export const SHARE_ATTRIBUTION_MAX_AGE_DAYS = 30;

export type ShareAttribution = ShareParams & { at: string };

/** Same-origin relative path only (open-redirect guard). */
export function safeReturnTo(value: string | null | undefined, fallback = "/portal"): string {
  if (!value) return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) return fallback;
  return value;
}

/**
 * Event posters and galleries store signed-upload object keys (BE-052) that are
 * not public URLs. Only absolute URLs and site paths render; keys return null.
 */
export function publicImageSrc(value: string | null | undefined): string | null {
  if (!value) return null;
  return value.startsWith("/") || /^https?:\/\//.test(value) ? value : null;
}

export type PublicVenue = { name: string; address: string };

/** Public session page payload. No venue notes, rates, or staff-only fields. */
export type PublicSessionPage = PublicSession & {
  classSlug: string;
  classShortDescription: string;
  heroImage: string | null;
  venue: PublicVenue | null;
  coachesDetailed: Pick<PublicCoach, "id" | "name" | "photoKey" | "specialties">[];
  /** Linked event when it is PUBLISHED or CANCELLED. */
  event: { id: string; title: string; status: EventStatus } | null;
};

/** Public event page payload. Never carries `internalNotes`. */
export type PublicEventPage = {
  id: string;
  title: string;
  summary: string;
  description: string;
  posterImage: string | null;
  galleryImages: string[];
  beneficiary: string;
  whatToBring: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
  /** Effective status: CANCELLED when either the event or its session is cancelled. */
  status: Extract<EventStatus, "PUBLISHED" | "CANCELLED">;
  session: PublicSessionPage;
};

/**
 * One attendee on a public roster. PRIVACY: never add last name, email,
 * contact number, profile/booking ids, booking or payment status, or times.
 */
export type PublicRosterAttendee = {
  /** Opaque, stable per session. Not reversible to an id. */
  key: string;
  displayName: string;
  avatarUrl: string | null;
  initials: string;
  isSelf: boolean;
  /** Only ever true on the viewer's own row when they opted out. */
  hiddenFromOthers?: boolean;
};

export type PublicRoster =
  | { visibility: "counts"; goingCount: number; spotsLeft: number }
  | {
      visibility: "list";
      goingCount: number;
      spotsLeft: number;
      /** Opted-out attendees other than the viewer. Rendered as "+N others". */
      hiddenCount: number;
      attendees: PublicRosterAttendee[];
    };

/** Booking statuses listed (and counted as "going") on a public roster. */
export const PUBLIC_ROSTER_STATUSES = ["CONFIRMED", "CHECKED_IN"] as const;

export type PublicRegistrationWindowState =
  | { state: "none" }
  | { state: "not_open"; opensAt: string }
  | { state: "open"; closesAt: string | null }
  | { state: "closed"; closedAt: string };

export function registrationWindowState(
  window: { registrationOpensAt: string | null; registrationClosesAt: string | null },
  nowIso: string,
): PublicRegistrationWindowState {
  const now = Date.parse(nowIso);
  const { registrationOpensAt: opens, registrationClosesAt: closes } = window;
  if (!opens && !closes) return { state: "none" };
  if (opens && now < Date.parse(opens)) return { state: "not_open", opensAt: opens };
  if (closes && now >= Date.parse(closes)) return { state: "closed", closedAt: closes };
  return { state: "open", closesAt: closes };
}

export function isPublicSessionStatus(status: SessionStatus): boolean {
  return status === "PUBLISHED" || status === "CANCELLED";
}
