import type { AdminVenue, VenueKind } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type VenueInput = {
  name: string;
  kind: VenueKind;
  address?: string;
  openingHours?: string;
  studioOwned?: boolean | null;
  notes?: string;
  active?: boolean;
};

export async function listVenues(
  fetcher: ApiFetcher,
  filters: { active?: boolean; kind?: VenueKind } = {},
): Promise<{ items: AdminVenue[] }> {
  const params = new URLSearchParams();
  if (filters.active !== undefined) params.set("active", String(filters.active));
  if (filters.kind) params.set("kind", filters.kind);
  const query = params.toString();
  return fetcher(`/api/admin/venues${query ? `?${query}` : ""}`);
}

export async function createVenue(
  fetcher: ApiFetcher,
  input: VenueInput,
): Promise<{ venue: AdminVenue }> {
  return fetcher("/api/admin/venues", { method: "POST", body: input });
}

export async function patchVenue(
  fetcher: ApiFetcher,
  id: string,
  input: Partial<VenueInput>,
): Promise<{ venue: AdminVenue }> {
  return fetcher(`/api/admin/venues/${id}`, { method: "PATCH", body: input });
}
