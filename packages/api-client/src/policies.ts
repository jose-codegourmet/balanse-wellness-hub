import type { CustomerPolicyForm } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type FormPolicy = {
  id: string;
  documentId: string;
  documentName: string;
  version: string;
  title: string;
  body: string;
  isPlaceholder: boolean;
};

export const getFormPolicies = (fetcher: ApiFetcher, form: CustomerPolicyForm) =>
  fetcher<{ items: FormPolicy[] }>(`/api/public/policy-forms/${form}`);

export const acceptPolicies = (
  fetcher: ApiFetcher,
  input: {
    form: CustomerPolicyForm;
    policyVersionIds: string[];
    bookingId?: string;
    acquisitionId?: string;
  },
) =>
  fetcher<{ acceptedAt: string; form: CustomerPolicyForm; policyVersionIds: string[] }>(
    "/api/me/policy-acceptances",
    { method: "POST", body: input },
  );

export const createPolicyDocument = (
  fetcher: ApiFetcher,
  input: { title: string; slug: string; kind: string; version: string; body: string },
) => fetcher("/api/admin/settings/policies", { method: "POST", body: input });

export const patchPolicyDocument = (
  fetcher: ApiFetcher,
  id: string,
  input: Partial<{ title: string; kind: string }>,
) => fetcher(`/api/admin/settings/policies/${id}`, { method: "PATCH", body: input });

export const createPolicyVersion = (
  fetcher: ApiFetcher,
  id: string,
  input: { version: string; title: string; body: string },
) => fetcher(`/api/admin/settings/policies/${id}/versions`, { method: "POST", body: input });

export const deletePolicyDocument = (fetcher: ApiFetcher, id: string) =>
  fetcher(`/api/admin/settings/policies/${id}`, { method: "DELETE" });

export const promotePolicyVersion = (
  fetcher: ApiFetcher,
  id: string,
  input: { version: string; title?: string; body?: string },
) => fetcher(`/api/admin/settings/policies/${id}/promote`, { method: "POST", body: input });
