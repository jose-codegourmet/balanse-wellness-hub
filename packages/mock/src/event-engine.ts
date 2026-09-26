import type {
  AdminEvent,
  AdminEventSessionSnapshot,
  AdminSession,
  EventStatus,
} from "@balanse/domain";
import {
  EVENT_CONFLICT_MESSAGES,
  EVENT_STATUSES,
  eventStatusLabel,
  FIELD_CONSTRAINTS,
  sessionStatusLabel,
} from "@balanse/domain";
import {
  EVENT_FIXTURE_PRICE_NOTE,
  type EventFixtureSession,
  eventFixtureSessions,
  type StoredSessionEvent,
} from "./event-fixtures";

export class EventMockError extends Error {
  constructor(
    message: string,
    readonly code:
      | "event_not_found"
      | "session_not_found"
      | "event_session_taken"
      | "event_on_cancelled_session"
      | "event_publish_requires_published_session"
      | "invalid_event",
  ) {
    super(message);
    this.name = "EventMockError";
  }
}

export type AdminEventWrite = {
  sessionId: string;
  title: string;
  summary?: string;
  description?: string;
  posterImage?: string | null;
  galleryImages?: string[];
  venueName?: string;
  venueAddress?: string;
  beneficiary?: string;
  whatToBring?: string;
  internalNotes?: string;
  registrationOpensAt?: string | null;
  registrationClosesAt?: string | null;
};

export type AdminEventPatch = Partial<Omit<AdminEventWrite, "sessionId">>;

export type AdminEventListQuery = {
  status?: EventStatus;
  sessionId?: string;
  from?: string;
  to?: string;
  search?: string;
};

export type EventEngineState = {
  events: StoredSessionEvent[];
};

const limits = FIELD_CONSTRAINTS.event;

function clip(value: string | undefined, max: number, fallback = ""): string {
  const next = (value ?? fallback).trim();
  if (next.length > max) {
    throw new EventMockError(`Must be at most ${max} characters.`, "invalid_event");
  }
  return next;
}

function parseInstant(value: string, label: string): number {
  const time = Date.parse(value);
  if (Number.isNaN(time)) {
    throw new EventMockError(`${label} is not a valid datetime.`, "invalid_event");
  }
  return time;
}

function assertWindow(opens: string | null, closes: string | null): void {
  if (
    opens &&
    closes &&
    parseInstant(closes, "registrationClosesAt") < parseInstant(opens, "registrationOpensAt")
  ) {
    throw new EventMockError(
      "Registration close must be on or after registration open.",
      "invalid_event",
    );
  }
}

function snapshotFromLive(session: AdminSession): AdminEventSessionSnapshot {
  return {
    id: session.id,
    classId: session.classId,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    customerPrice: session.pricePhp.toFixed(2),
    status: session.status,
    statusLabel: sessionStatusLabel(session.status),
  };
}

function snapshotFromFixture(session: EventFixtureSession): AdminEventSessionSnapshot {
  return {
    id: session.id,
    classId: session.classId,
    startsAt: session.startsAt,
    endsAt: session.endsAt,
    capacity: session.capacity,
    customerPrice: session.customerPrice,
    status: session.status,
    statusLabel: sessionStatusLabel(session.status),
  };
}

export function resolveEventSession(
  sessionId: string,
  liveSessions: readonly AdminSession[],
): AdminEventSessionSnapshot | null {
  const live = liveSessions.find((session) => session.id === sessionId);
  if (live) return snapshotFromLive(live);
  const fixture = eventFixtureSessions.find((session) => session.id === sessionId);
  return fixture ? snapshotFromFixture(fixture) : null;
}

function present(row: StoredSessionEvent, liveSessions: readonly AdminSession[]): AdminEvent {
  const session = resolveEventSession(row.sessionId, liveSessions);
  if (!session) {
    throw new EventMockError("Session not found.", "session_not_found");
  }
  return {
    ...row,
    galleryImages: [...row.galleryImages],
    statusLabel: eventStatusLabel(row.status),
    session,
  };
}

export function listAdminEvents(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  query: AdminEventListQuery | undefined,
  nowIso: string,
): AdminEvent[] {
  const now = parseInstant(nowIso, "now");
  let rows = state.events;
  if (query?.status) {
    if (!EVENT_STATUSES.includes(query.status)) {
      throw new EventMockError(
        "Status must be DRAFT, PUBLISHED, CANCELLED, or ARCHIVED.",
        "invalid_event",
      );
    }
    rows = rows.filter((row) => row.status === query.status);
  }
  if (query?.sessionId) rows = rows.filter((row) => row.sessionId === query.sessionId);
  const from = query?.from ? parseInstant(query.from, "from") : null;
  const to = query?.to ? parseInstant(query.to, "to") : null;
  if (from !== null && to !== null && from >= to) {
    throw new EventMockError("from must be earlier than to.", "invalid_event");
  }
  const search = query?.search?.trim().toLowerCase();
  const presented = rows
    .map((row) => present(row, liveSessions))
    .filter((event) => {
      const starts = Date.parse(event.session.startsAt);
      if (from !== null && starts < from) return false;
      if (to !== null && starts >= to) return false;
      if (search && !event.title.toLowerCase().includes(search)) return false;
      return true;
    });
  presented.sort((a, b) => {
    const aStart = Date.parse(a.session.startsAt);
    const bStart = Date.parse(b.session.startsAt);
    const aUpcoming = aStart >= now;
    const bUpcoming = bStart >= now;
    if (aUpcoming !== bUpcoming) return aUpcoming ? -1 : 1;
    if (aStart !== bStart) return aUpcoming ? aStart - bStart : bStart - aStart;
    return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
  });
  return presented;
}

export function getAdminEvent(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  id: string,
): AdminEvent | null {
  const row = state.events.find((event) => event.id === id);
  return row ? present(row, liveSessions) : null;
}

export function getAdminEventForSession(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  sessionId: string,
): AdminEvent | null {
  const row = state.events.find((event) => event.sessionId === sessionId);
  return row ? present(row, liveSessions) : null;
}

function readGallery(images: string[] | undefined): string[] {
  if (!images) return [];
  if (images.length > limits.galleryImages.maxItems) {
    throw new EventMockError(
      `At most ${limits.galleryImages.maxItems} gallery images.`,
      "invalid_event",
    );
  }
  return images.map((item) => clip(item, limits.galleryImages.itemMax));
}

function readPoster(value: string | null | undefined): string | null {
  if (value == null || value === "") return null;
  return clip(value, limits.posterImage.max);
}

export function createAdminEvent(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  input: AdminEventWrite,
  nowIso: string,
): AdminEvent {
  const session = resolveEventSession(input.sessionId, liveSessions);
  if (!session) throw new EventMockError("Session not found.", "session_not_found");
  if (session.status === "CANCELLED") {
    throw new EventMockError(
      EVENT_CONFLICT_MESSAGES.event_on_cancelled_session,
      "event_on_cancelled_session",
    );
  }
  const taken = state.events.find((event) => event.sessionId === input.sessionId);
  if (taken) {
    throw new EventMockError(EVENT_CONFLICT_MESSAGES.event_session_taken, "event_session_taken");
  }
  const title = clip(input.title, limits.title.max);
  if (!title) throw new EventMockError("Title is required.", "invalid_event");
  const registrationOpensAt = input.registrationOpensAt ?? null;
  const registrationClosesAt = input.registrationClosesAt ?? null;
  if (registrationOpensAt) parseInstant(registrationOpensAt, "registrationOpensAt");
  if (registrationClosesAt) parseInstant(registrationClosesAt, "registrationClosesAt");
  assertWindow(registrationOpensAt, registrationClosesAt);
  const row: StoredSessionEvent = {
    id: `event-${crypto.randomUUID()}`,
    sessionId: input.sessionId,
    title,
    summary: clip(input.summary, limits.summary.max),
    description: clip(input.description, limits.description.max),
    posterImage: readPoster(input.posterImage),
    galleryImages: readGallery(input.galleryImages),
    venueName: clip(input.venueName, limits.venueName.max),
    venueAddress: clip(input.venueAddress, limits.venueAddress.max),
    beneficiary: clip(input.beneficiary, limits.beneficiary.max),
    whatToBring: clip(input.whatToBring, limits.whatToBring.max),
    internalNotes: clip(input.internalNotes, limits.internalNotes.max, EVENT_FIXTURE_PRICE_NOTE),
    registrationOpensAt,
    registrationClosesAt,
    status: "DRAFT",
    isPlaceholder: false,
    createdAt: nowIso,
    updatedAt: nowIso,
  };
  state.events.push(row);
  return present(row, liveSessions);
}

export function updateAdminEvent(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  id: string,
  patch: AdminEventPatch,
  nowIso: string,
): AdminEvent {
  const row = state.events.find((event) => event.id === id);
  if (!row) throw new EventMockError("Event not found.", "event_not_found");
  if (patch.title !== undefined) {
    const title = clip(patch.title, limits.title.max);
    if (!title) throw new EventMockError("Title is required.", "invalid_event");
    row.title = title;
  }
  if (patch.summary !== undefined) row.summary = clip(patch.summary, limits.summary.max);
  if (patch.description !== undefined) {
    row.description = clip(patch.description, limits.description.max);
  }
  if (patch.posterImage !== undefined) row.posterImage = readPoster(patch.posterImage);
  if (patch.galleryImages !== undefined) row.galleryImages = readGallery(patch.galleryImages);
  if (patch.venueName !== undefined) row.venueName = clip(patch.venueName, limits.venueName.max);
  if (patch.venueAddress !== undefined) {
    row.venueAddress = clip(patch.venueAddress, limits.venueAddress.max);
  }
  if (patch.beneficiary !== undefined) {
    row.beneficiary = clip(patch.beneficiary, limits.beneficiary.max);
  }
  if (patch.whatToBring !== undefined) {
    row.whatToBring = clip(patch.whatToBring, limits.whatToBring.max);
  }
  if (patch.internalNotes !== undefined) {
    row.internalNotes = clip(patch.internalNotes, limits.internalNotes.max);
  }
  const opens =
    patch.registrationOpensAt === undefined ? row.registrationOpensAt : patch.registrationOpensAt;
  const closes =
    patch.registrationClosesAt === undefined
      ? row.registrationClosesAt
      : patch.registrationClosesAt;
  if (opens) parseInstant(opens, "registrationOpensAt");
  if (closes) parseInstant(closes, "registrationClosesAt");
  assertWindow(opens, closes);
  row.registrationOpensAt = opens;
  row.registrationClosesAt = closes;
  row.updatedAt = nowIso;
  return present(row, liveSessions);
}

function setStatus(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  id: string,
  status: EventStatus,
  nowIso: string,
): AdminEvent {
  const row = state.events.find((event) => event.id === id);
  if (!row) throw new EventMockError("Event not found.", "event_not_found");
  if (row.status === status) return present(row, liveSessions);
  if (status === "PUBLISHED") {
    const session = resolveEventSession(row.sessionId, liveSessions);
    if (!session) throw new EventMockError("Session not found.", "session_not_found");
    if (session.status !== "PUBLISHED") {
      const message =
        session.status === "CANCELLED"
          ? "This session is cancelled, so the event cannot be published."
          : EVENT_CONFLICT_MESSAGES.event_publish_requires_published_session;
      throw new EventMockError(message, "event_publish_requires_published_session");
    }
  }
  row.status = status;
  row.updatedAt = nowIso;
  return present(row, liveSessions);
}

export function publishAdminEvent(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  id: string,
  nowIso: string,
): AdminEvent {
  return setStatus(state, liveSessions, id, "PUBLISHED", nowIso);
}

export function cancelAdminEvent(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  id: string,
  nowIso: string,
): AdminEvent {
  return setStatus(state, liveSessions, id, "CANCELLED", nowIso);
}

export function archiveAdminEvent(
  state: EventEngineState,
  liveSessions: readonly AdminSession[],
  id: string,
  nowIso: string,
): AdminEvent {
  return setStatus(state, liveSessions, id, "ARCHIVED", nowIso);
}

/** Cancelling a session surfaces a still-live event as cancelled. Archive stays put. */
export function cancelLiveEventsForSession(
  state: EventEngineState,
  sessionId: string,
  nowIso: string,
): void {
  for (const event of state.events) {
    if (event.sessionId !== sessionId) continue;
    if (event.status !== "DRAFT" && event.status !== "PUBLISHED") continue;
    event.status = "CANCELLED";
    event.updatedAt = nowIso;
  }
}
