import type { AdminCoach, CoachRateType, PublicCoach, SignedUploadIntent } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

/**
 * Rate fields are stripped server-side for actors without `coach_rates.read`
 * (WIRE-0602, #359) — physically absent from the response, not `null`.
 */
export type AdminCoachResponse = Omit<AdminCoach, "defaultRatePhp" | "rateType"> &
  Partial<Pick<AdminCoach, "defaultRatePhp" | "rateType">>;

export type CoachInput = {
  name: string;
  specialties: string[];
  shortBio: string;
  photoKey: string | null;
  active: boolean;
  defaultRatePhp?: number;
  rateType?: CoachRateType;
};

export async function listPublicCoaches(fetcher: ApiFetcher): Promise<{ items: PublicCoach[] }> {
  return fetcher("/api/public/coaches");
}

export async function listAdminCoaches(
  fetcher: ApiFetcher,
): Promise<{ items: AdminCoachResponse[] }> {
  return fetcher("/api/admin/coaches");
}

export async function createCoach(
  fetcher: ApiFetcher,
  input: CoachInput,
): Promise<{ coach: AdminCoachResponse }> {
  return fetcher("/api/admin/coaches", { method: "POST", body: input });
}

export async function patchCoach(
  fetcher: ApiFetcher,
  id: string,
  input: Partial<CoachInput>,
): Promise<{ coach: AdminCoachResponse }> {
  return fetcher(`/api/admin/coaches/${id}`, { method: "PATCH", body: input });
}

/** Mint step of the BE-052 lifecycle: signed URL to PUT bytes to, then confirm with its `objectKey`. */
export async function mintCoachPhoto(
  fetcher: ApiFetcher,
  coachId: string,
  contentType: string,
): Promise<SignedUploadIntent> {
  return fetcher(`/api/admin/coaches/${coachId}/photo`, { method: "POST", body: { contentType } });
}

export async function confirmCoachPhoto(
  fetcher: ApiFetcher,
  coachId: string,
  objectKey: string,
): Promise<{ coach: { id: string; photoKey: string | null } }> {
  return fetcher(`/api/admin/coaches/${coachId}/photo`, { method: "POST", body: { objectKey } });
}

export async function removeCoachPhoto(
  fetcher: ApiFetcher,
  coachId: string,
): Promise<{ coach: { id: string; photoKey: string | null } }> {
  return fetcher(`/api/admin/coaches/${coachId}/photo`, { method: "DELETE" });
}
