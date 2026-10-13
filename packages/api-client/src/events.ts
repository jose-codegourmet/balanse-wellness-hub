import type { AdminEvent, EventStatus, PublicEventPage, SignedUploadIntent } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type AdminEventFilters = {
  status?: EventStatus;
  sessionId?: string;
  from?: string;
  to?: string;
  search?: string;
};

export type EventInput = {
  sessionId: string;
  title: string;
  summary: string;
  description: string;
  posterImage: string | null;
  galleryImages: string[];
  beneficiary: string;
  whatToBring: string;
  internalNotes: string;
  registrationOpensAt: string | null;
  registrationClosesAt: string | null;
};

function query(filters: AdminEventFilters): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== "") params.set(key, String(value));
  }
  return params.size ? `?${params.toString()}` : "";
}

export async function listAdminEvents(fetcher: ApiFetcher, filters: AdminEventFilters = {}) {
  return fetcher<{ items: AdminEvent[] }>(`/api/admin/events${query(filters)}`);
}

export async function getAdminEvent(fetcher: ApiFetcher, id: string) {
  return fetcher<{ event: AdminEvent }>(`/api/admin/events/${id}`);
}

export async function getEventForSession(fetcher: ApiFetcher, sessionId: string) {
  const { items } = await listAdminEvents(fetcher, { sessionId });
  return items[0] ?? null;
}

export async function createEvent(fetcher: ApiFetcher, input: EventInput) {
  return fetcher<{ event: AdminEvent }>("/api/admin/events", { method: "POST", body: input });
}

export async function patchEvent(fetcher: ApiFetcher, id: string, input: Partial<EventInput>) {
  return fetcher<{ event: AdminEvent }>(`/api/admin/events/${id}`, {
    method: "PATCH",
    body: input,
  });
}

export const publishEvent = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ event: AdminEvent }>(`/api/admin/events/${id}/publish`, { method: "POST" });
export const cancelEvent = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ event: AdminEvent }>(`/api/admin/events/${id}/cancel`, { method: "POST" });
export const archiveEvent = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ event: AdminEvent }>(`/api/admin/events/${id}/archive`, { method: "POST" });

export const getPublicEvent = (fetcher: ApiFetcher, id: string) =>
  fetcher<PublicEventPage>(`/api/public/events/${id}`);

export const mintEventImage = (fetcher: ApiFetcher, eventId: string, contentType: string) =>
  fetcher<SignedUploadIntent>(`/api/admin/events/${eventId}/images`, {
    method: "POST",
    body: { contentType },
  });

export const confirmEventImage = (fetcher: ApiFetcher, eventId: string, objectKey: string) =>
  fetcher<{ objectKey: string }>(`/api/admin/events/${eventId}/images`, {
    method: "POST",
    body: { objectKey },
  });
