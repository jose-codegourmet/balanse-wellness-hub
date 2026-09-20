import { BOOKING_CUTOFF_MINUTES_BEFORE_START } from "@balanse/domain";
import type { ApiDeps } from "../deps";
import { ApiError } from "../errors";
import { ok, searchParams } from "../http";
import { assertPublicPayload, money } from "../presenters";
import { readSettings } from "../settings";
import { sessionConsumedCapacity, sessionPastCutoff, sessionsConsumedCapacity } from "../sql";

const PUBLIC_CACHE = { "cache-control": "public, max-age=30, stale-while-revalidate=60" };

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

async function publicSessionDto(
  deps: ApiDeps,
  session: {
    id: string;
    startsAt: Date;
    endsAt: Date;
    capacity: number;
    status: string;
    customerPrice: unknown;
    gymClass: { id: string; name: string };
    coach: { id: string; name: string; photoKey: string | null; specialties: string[] } | null;
  },
  consumed: number,
  pastCutoff: boolean,
) {
  const remainingSlots = Math.max(0, session.capacity - consumed);
  const now = deps.now();
  const pastStart = now >= session.startsAt;
  const published = session.status === "PUBLISHED";
  const reservable = published && !pastStart && !pastCutoff && remainingSlots > 0;
  const waitlistEligible = published && !pastStart && !pastCutoff && remainingSlots === 0;
  return {
    id: session.id,
    startsAt: session.startsAt.toISOString(),
    endsAt: session.endsAt.toISOString(),
    class: session.gymClass,
    coach: session.coach,
    customerPrice: money(session.customerPrice),
    capacity: session.capacity,
    remainingSlots,
    consumedCapacity: consumed,
    reservable,
    waitlistEligible,
    nonReservableReason: reservable
      ? null
      : !published
        ? session.status === "CANCELLED"
          ? "cancelled"
          : "unpublished"
        : pastStart
          ? "past"
          : pastCutoff
            ? "cutoff"
            : remainingSlots === 0
              ? "full"
              : "unavailable",
    cutoffMinutesBeforeStart: BOOKING_CUTOFF_MINUTES_BEFORE_START,
  };
}

export async function getPublicSessions(deps: ApiDeps, req: Request): Promise<Response> {
  const { from, to } = parseRange(req);
  const sessions = await deps.prisma.gymSession.findMany({
    where: { startsAt: { gte: from, lt: to }, status: "PUBLISHED" },
    orderBy: { startsAt: "asc" },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      status: true,
      customerPrice: true,
      gymClass: { select: { id: true, name: true } },
      coach: { select: { id: true, name: true, photoKey: true, specialties: true } },
    },
  });
  const consumed = await sessionsConsumedCapacity(
    deps,
    sessions.map((item) => item.id),
  );
  const items = [];
  for (const session of sessions) {
    const pastCutoff = await sessionPastCutoff(deps, session.id);
    items.push(await publicSessionDto(deps, session, consumed.get(session.id) ?? 0, pastCutoff));
  }
  const body = { items };
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
}

export async function getPublicSession(
  deps: ApiDeps,
  _req: Request,
  id: string,
): Promise<Response> {
  const session = await deps.prisma.gymSession.findUnique({
    where: { id },
    select: {
      id: true,
      startsAt: true,
      endsAt: true,
      capacity: true,
      status: true,
      customerPrice: true,
      gymClass: { select: { id: true, name: true } },
      coach: { select: { id: true, name: true, photoKey: true, specialties: true } },
    },
  });
  if (!session || session.status === "DRAFT") {
    throw new ApiError(404, "session_not_found", "Session not found.");
  }
  const consumed = await sessionConsumedCapacity(deps, session.id);
  const pastCutoff = await sessionPastCutoff(deps, session.id);
  const body = await publicSessionDto(deps, session, consumed, pastCutoff);
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
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

export async function getPublicClasses(deps: ApiDeps): Promise<Response> {
  const items = await deps.prisma.gymClass.findMany({
    where: { active: true },
    orderBy: { name: "asc" },
    select: { id: true, name: true, shortDescription: true, defaultDurationMinutes: true },
  });
  const body = { items };
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
  assertPublicPayload(body);
  return ok(body, PUBLIC_CACHE);
}
