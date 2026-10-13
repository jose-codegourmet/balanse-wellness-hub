import type {
  ClassChangeRequest,
  CreateClassChangeRequestInput,
  SubstituteCoachOption,
} from "@balanse/domain";
import type { ApiFetcher } from "./classes";

const requestPath = (id: string) => `/api/admin/class-change-requests/${encodeURIComponent(id)}`;

export const listAdminClassChangeRequests = (fetcher: ApiFetcher) =>
  fetcher<{ items: ClassChangeRequest[] }>("/api/admin/class-change-requests");

export const listAdminSubstituteCoaches = (fetcher: ApiFetcher, sessionId: string) =>
  fetcher<{ items: SubstituteCoachOption[] }>(
    `/api/admin/sessions/${encodeURIComponent(sessionId)}/substitute-coaches`,
  );

export const createAdminClassChangeRequest = (
  fetcher: ApiFetcher,
  input: CreateClassChangeRequestInput,
) =>
  fetcher<{ request: ClassChangeRequest }>(
    `/api/admin/sessions/${encodeURIComponent(input.sessionId)}/class-change-requests`,
    { method: "POST", body: input },
  );

export const withdrawAdminClassChangeRequest = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ request: ClassChangeRequest }>(`${requestPath(id)}/withdraw`, { method: "POST" });

export const approveAdminClassChangeRequest = (
  fetcher: ApiFetcher,
  id: string,
  note?: string | null,
) =>
  fetcher<{ request: ClassChangeRequest }>(`${requestPath(id)}/approve`, {
    method: "POST",
    body: { note },
  });

export const denyAdminClassChangeRequest = (fetcher: ApiFetcher, id: string, note: string) =>
  fetcher<{ request: ClassChangeRequest }>(`${requestPath(id)}/deny`, {
    method: "POST",
    body: { note },
  });
