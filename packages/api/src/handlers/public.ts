import type {
  EventStatus,
  PublicEventPage,
  PublicSessionPage,
  SessionStatus,
} from "@balanse/domain";
import { readClassCatalogue } from "../class-catalogue";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, searchParams } from "../http";
import { assertPublicPayload, sessionAvailability } from "../presenters";
import { readSettings } from "../settings";
import { sessionPastCutoff, sessionsConsumedCapacity } from "../sql";

const PUBLIC_CACHE = { "cache-control": "public, max-age=30, stale-while-revalidate=60" };
const POLICY_FORMS = new Set([
  "sign_up",
  "booking",
  "package_request",
  "payment_proof",
  "reschedule",
  "cancellation",
  "contact",
]);
const PRISMA_POLICY_FORMS: Record<
  string,
  | "SIGN_UP"
  | "BOOKING"
  | "PACKAGE_REQUEST"
  | "PAYMENT_PROOF"
  | "RESCHEDULE"
  | "CANCELLATION"
  | "CONTACT"
> = {
  sign_up: "SIGN_UP",
  booking: "BOOKING",
  package_request: "PACKAGE_REQUEST",
  payment_proof: "PAYMENT_PROOF",
  reschedule: "RESCHEDULE",
  cancellation: "CANCELLATION",
  contact: "CONTACT",
};

function parseRange(req: Request): { from: Date; to: Date } {
  const params = searchParams(req);
  const fromRaw = params.get("from") ?? params.get("dateFrom");
  const toRaw = params.get("to") ?? params.get("dateTo");
  if (!fromRaw || !toRaw) {
    throw new ApiError(400, "date_range_required", "from and to query parameters are required.");
  }
  const from = new Date(fromRaw);
  const to = new Date(toRaw);
  if (Number.isNaN(from.getTime()) || Number.isNaN(to.getTime()) || from >= to) {
    throw new ApiError(400, "invalid_date_range", "Provide a valid from/to window.");
  }
  return { from, to };
}

/** `PublicSession` for calendar/list reads. One extra `sessionPastCutoff` call per row (small, paginated-by-date lists; mirrors the existing admin list convention). */
async function publicSessionDto(
  deps: ApiDeps,
  session: {
    id: string;
    name: string | null;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    status: SessionStatus;
    customerPrice: unknown;
    gymClass: { id: string; name: string };
    coaches: { coach: { id: string; name: string; photoKey: string | null } }[];
  },
  consumed: number,
) {
  const remainingSlots = Math.max(0, session.capacity - consumed);
  const now = deps.now();
  const pastStart = now >= session.startsAt;
  const pastCutoff = await sessionPastCutoff(deps, session.id);
  const availability = sessionAvailability({
    status: session.status,
    remainingSlots,
    pastStart,
    pastCutoff,
  });
  const coaches = session.coaches.map(({ coach }) => coach);
  return {
    id: session.id,
    name: session.name,
    classId: session.gymClass.id,
    className: session.gymClass.name,
    coaches,
    coachName: coaches.map((coach) => coach.name).join(" & "),
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    pricePhp: Number(session.customerPrice),
    capacity: session.capacity,
    remainingSlots,
    reservable:
      session.status === "PUBLISHED" &&
      availability !== "past" &&
      availability !== "cancelled" &&
      availability !== "past_cutoff" &&
      remainingSlots > 0,
    availability,
    status: session.status,
  };
}

export async function getPublicSessions(deps: ApiDeps, req: Request): Promise<Response> {
  const { from, to } = parseRange(req);
  const sessions = await deps.prisma.gymSession.findMany({
    where: { startsAt: { gte: from, lt: to }, status: "PUBLISHED" },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      name: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      status: true,
      customerPrice: true,
      gymClass: { select: { id: true, name: true } },
      coaches: { select: { coach: { select: { id: true, name: true, photoKey: true } } } },
    },
  });
  const consumed = await sessionsConsumedCapacity(
    deps,
    sessions.map((item) => item.id),
  );
  const items = [];
  for (const session of sessions) {
    items.push(await publicSessionDto(deps, session, consumed.get(session.id) ?? 0));
  }
  const body = { items };
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
}

type PublicSessionRpcRow = {
  session_id: string;
  class_id: string;
  class_name: string;
  class_slug: string;
  occurrence_title: string | null;
  starts_at: Date;
  ends_at: Date;
  capacity: number;
  remaining_slots: number;
  customer_price: unknown;
  status: SessionStatus;
  bookable: boolean;
  venue_name: string | null;
  venue_address: string | null;
  coaches: { id: string; name: string; specialties: string[]; photoKey: string | null }[];
  event_id: string | null;
  event_title: string | null;
  event_status: EventStatus | null;
};

/**
 * Single-session detail routes through `app_public.public_session`
 * (WIRE-0401, #361) rather than rebuilding the join/consumed-capacity logic
 * in Prisma: one round trip, and the SQL stays the single source of truth
 * for "published or cancelled" visibility.
 */
export async function getPublicSession(
  deps: ApiDeps,
  _req: Request,
  id: string,
): Promise<Response> {
  const rows = await deps.prisma.$queryRawUnsafe<PublicSessionRpcRow[]>(
    `SELECT * FROM app_public.public_session($1)`,
    id,
  );
  const row = rows[0];
  if (!row) throw new ApiError(404, "session_not_found", "Session not found.");
  const gymClass = await deps.prisma.gymClass.findUnique({
    where: { id: row.class_id },
    select: { shortDescription: true, heroImage: true },
  });
  const now = deps.now();
  const pastStart = now >= row.starts_at;
  const pastCutoff = await sessionPastCutoff(deps, id);
  const availability = sessionAvailability({
    status: row.status,
    remainingSlots: row.remaining_slots,
    pastStart,
    pastCutoff,
  });
  const body = {
    id: row.session_id,
    name: row.occurrence_title,
    classId: row.class_id,
    className: row.class_name,
    coaches: row.coaches.map(({ id: coachId, name, photoKey }) => ({
      id: coachId,
      name,
      photoKey,
    })),
    coachName: row.coaches.map((coach) => coach.name).join(" & "),
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at.toISOString(),
    pricePhp: Number(row.customer_price),
    capacity: row.capacity,
    remainingSlots: row.remaining_slots,
    reservable:
      row.status === "PUBLISHED" &&
      row.bookable &&
      availability !== "past" &&
      availability !== "cancelled" &&
      availability !== "past_cutoff" &&
      row.remaining_slots > 0,
    availability,
    status: row.status,
    classSlug: row.class_slug,
    classShortDescription: gymClass?.shortDescription ?? "",
    heroImage: gymClass?.heroImage ?? null,
    venue: row.venue_name ? { name: row.venue_name, address: row.venue_address ?? "" } : null,
    coachesDetailed: row.coaches,
    event:
      row.event_id && row.event_title
        ? { id: row.event_id, title: row.event_title, status: row.event_status as EventStatus }
        : null,
  };
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
}

type PublicEventRpcRow = {
  event_id: string;
  title: string;
  summary: string;
  description: string;
  poster_image: string | null;
  gallery_images: string[];
  beneficiary: string;
  what_to_bring: string;
  registration_opens_at: Date | null;
  registration_closes_at: Date | null;
  status: Extract<EventStatus, "PUBLISHED" | "CANCELLED">;
  session_id: string;
  class_id: string;
  class_name: string;
  class_slug: string;
  occurrence_title: string | null;
  starts_at: Date;
  ends_at: Date;
  capacity: number;
  remaining_slots: number;
  customer_price: unknown;
  session_status: SessionStatus;
  venue_name: string | null;
  venue_address: string | null;
  coaches: PublicSessionRpcRow["coaches"];
};

/** Seeded site paths and uploaded marketing object keys are both valid media values. */
function publicEventImage(deps: ApiDeps, value: string | null): string | null {
  if (!value || value.startsWith("/") || /^https?:\/\//.test(value)) return value;
  return deps.storage.publicUrl("marketing-assets", value);
}

/**
 * Public event detail is deliberately read through `app_public.public_event`.
 * It is the DB's visibility/privacy boundary and never exposes staff notes.
 */
export async function getPublicEvent(deps: ApiDeps, _req: Request, id: string): Promise<Response> {
  const rows = await deps.prisma.$queryRawUnsafe<PublicEventRpcRow[]>(
    `SELECT * FROM app_public.public_event($1)`,
    id,
  );
  const row = rows[0];
  if (!row) throw new ApiError(404, "event_not_found", "Event not found.");
  const gymClass = await deps.prisma.gymClass.findUnique({
    where: { id: row.class_id },
    select: { shortDescription: true, heroImage: true },
  });
  const now = deps.now();
  const availability = sessionAvailability({
    status: row.session_status,
    remainingSlots: row.remaining_slots,
    pastStart: now >= row.starts_at,
    pastCutoff: await sessionPastCutoff(deps, row.session_id),
  });
  const coaches = row.coaches.map(({ id: coachId, name, photoKey }) => ({
    id: coachId,
    name,
    photoKey,
  }));
  const session: PublicSessionPage = {
    id: row.session_id,
    name: row.occurrence_title,
    classId: row.class_id,
    className: row.class_name,
    coaches,
    coachName: coaches.map((coach) => coach.name).join(" & "),
    startsAt: row.starts_at.toISOString(),
    endsAt: row.ends_at.toISOString(),
    pricePhp: Number(row.customer_price),
    capacity: row.capacity,
    remainingSlots: row.remaining_slots,
    reservable:
      row.session_status === "PUBLISHED" &&
      availability !== "past" &&
      availability !== "cancelled" &&
      availability !== "past_cutoff" &&
      row.remaining_slots > 0,
    availability,
    status: row.session_status,
    classSlug: row.class_slug,
    classShortDescription: gymClass?.shortDescription ?? "",
    heroImage: gymClass?.heroImage ?? null,
    venue: row.venue_name ? { name: row.venue_name, address: row.venue_address ?? "" } : null,
    coachesDetailed: row.coaches,
    event: { id: row.event_id, title: row.title, status: row.status },
  };
  const body: PublicEventPage = {
    id: row.event_id,
    title: row.title,
    summary: row.summary,
    description: row.description,
    posterImage: publicEventImage(deps, row.poster_image),
    galleryImages: row.gallery_images.map((image) => publicEventImage(deps, image) ?? image),
    beneficiary: row.beneficiary,
    whatToBring: row.what_to_bring,
    registrationOpensAt: row.registration_opens_at?.toISOString() ?? null,
    registrationClosesAt: row.registration_closes_at?.toISOString() ?? null,
    status: row.status,
    session,
  };
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
}

type PublicRosterRpcRow = {
  going_count: number;
  spots_left: number;
  hidden_count: number;
  attendees: Array<{
    row_key: string;
    display_name: string;
    avatar_key: string | null;
    initials: string;
    is_self: boolean;
  }>;
};

/** Raw `Authorization: Bearer` token, forwarded so `auth.uid()` resolves inside the RPC below. */
function bearerToken(req: Request): string | null {
  const header = req.headers.get("authorization");
  return header?.toLowerCase().startsWith("bearer ") ? header.slice(7).trim() : null;
}

/**
 * `app_public.public_session_roster` reads `auth.uid()` (WIRE-0404, #361):
 * anon gets counts only, a signed-in viewer gets display rows. Prisma's
 * connection has no JWT of its own, so the viewer's user id (resolved from
 * their bearer token, same as `resolveActor`) is set as `request.jwt.claim.sub`
 * on this transaction only — mirrors the `set_config` pattern already used
 * for `app.actor_staff_id` in `admin-events.ts`. `avatar_key` is minted into a
 * ~10-minute signed URL here; the raw storage key is never returned.
 */
export async function getPublicSessionRoster(
  deps: ApiDeps,
  req: Request,
  id: string,
): Promise<Response> {
  const viewer = await deps.resolveUser(bearerToken(req));
  const row = await deps.prisma.$transaction(async (tx) => {
    if (viewer) {
      await tx.$executeRaw`SELECT set_config('request.jwt.claim.sub', ${viewer.id}, true)`;
    }
    const rows = await tx.$queryRawUnsafe<PublicRosterRpcRow[]>(
      `SELECT * FROM app_public.public_session_roster($1)`,
      id,
    );
    return rows[0] ?? null;
  });
  if (!row) throw new ApiError(404, "session_not_found", "Session not found.");

  if (!viewer) {
    const body = {
      visibility: "counts" as const,
      goingCount: row.going_count,
      spotsLeft: row.spots_left,
    };
    assertPublicPayload(body);
    return ok(body, { "cache-control": "no-store" });
  }

  const attendees = await Promise.all(
    row.attendees.map(async (attendee) => ({
      key: attendee.row_key,
      displayName: attendee.display_name,
      avatarUrl: attendee.avatar_key
        ? await deps.storage.createSignedUrl("avatars", attendee.avatar_key, 600)
        : null,
      initials: attendee.initials,
      isSelf: attendee.is_self,
    })),
  );
  const body = {
    visibility: "list" as const,
    goingCount: row.going_count,
    spotsLeft: row.spots_left,
    hiddenCount: row.hidden_count,
    attendees,
  };
  assertPublicPayload(body);
  return ok(body, { "cache-control": "no-store" });
}

export async function getPublicCoaches(deps: ApiDeps): Promise<Response> {
  const coaches = await deps.prisma.$queryRawUnsafe<
    Array<{
      id: string;
      name: string;
      specialties: string[];
      shortBio: string;
      photoKey: string | null;
      active: boolean;
    }>
  >(
    `SELECT id, name, specialties, "shortBio", "photoKey", active FROM coaches_public ORDER BY name`,
  );
  const body = { items: coaches };
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
}

/**
 * Full `PublicClass` shape (WIRE-0502, #358) read through the same
 * SECURITY INVOKER RPC path as the admin catalogue editor. No access token:
 * `catalogue_class_read` RLS restricts anon/anonymous reads to active rows.
 */
export async function getPublicClasses(_deps: ApiDeps): Promise<Response> {
  const { classes } = await readClassCatalogue();
  const body = { items: classes.filter((item) => item.active) };
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
}

export async function getPublicContent(deps: ApiDeps): Promise<Response> {
  const settings = await readSettings(deps);
  const faqs = await deps.prisma.faqItem.findMany({
    orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
  });
  const body = {
    about: settings.content.about,
    contact: {
      phone: settings.business.phone,
      email: settings.business.email,
      address: settings.business.address,
    },
    faqs: faqs.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      sortOrder: row.sortOrder,
    })),
    business: {
      name: settings.business.name,
      phone: settings.business.phone,
      email: settings.business.email,
      address: settings.business.address,
      instagram: settings.business.instagram,
      tiktok: settings.business.tiktok,
      whatsapp: settings.business.whatsapp,
      openingHours: settings.business.openingHours,
    },
  };
  // Not assertPublicPayload: `PUBLIC_FORBIDDEN_KEYS` blocks "email" to catch
  // a leaked customer/profile email, but this payload's only "email" is the
  // studio's own public contact address — exactly what this endpoint exists
  // to expose (#370). The blanket check previously 500'd every call here.
  return ok(body, PUBLIC_CACHE);
}

/** Current policy versions attached to a public customer form (WIRE-1604). */
export async function getPublicFormPolicies(
  deps: ApiDeps,
  _req: Request,
  form: string,
): Promise<Response> {
  if (!POLICY_FORMS.has(form)) {
    throw new ApiError(404, "policy_form_not_found", "Unknown customer policy form.");
  }
  const requirements = await deps.prisma.policyFormRequirement.findMany({
    where: { form: PRISMA_POLICY_FORMS[form] },
    orderBy: { sortOrder: "asc" },
    include: {
      document: { include: { versions: { where: { isCurrent: true }, take: 1 } } },
    },
  });
  const items = requirements.flatMap(({ document }) => {
    const version = document.versions[0];
    return version
      ? [
          {
            id: version.id,
            documentId: document.id,
            documentName: document.title,
            version: version.version,
            title: version.title,
            body: version.body,
            isPlaceholder: version.isPlaceholder,
          },
        ]
      : [];
  });
  return ok({ items }, PUBLIC_CACHE);
}
