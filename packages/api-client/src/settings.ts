import { type AdminSettings, emptyPolicyFormRequirements } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type AdminSettingsResponse = Record<string, unknown>;

function normalizeSettings(raw: AdminSettingsResponse): AdminSettings {
  const business = (raw.business ?? {}) as Record<string, unknown>;
  const content = (raw.content ?? {}) as Record<string, unknown>;
  const payment = (raw.payment ?? {}) as Record<string, unknown>;
  return {
    businessName: String(business.name ?? ""),
    openingHours: String(business.openingHours ?? ""),
    about: String(content.about ?? ""),
    contact: {
      phone: String(business.phone ?? ""),
      email: String(content.email ?? ""),
      address: String(business.address ?? ""),
    },
    faqs: Array.isArray(content.faqs) ? (content.faqs as AdminSettings["faqs"]) : [],
    gcashName: String(payment.gcashAccountName ?? ""),
    gcashNumber: String(payment.gcashNumber ?? ""),
    qrImageKey: typeof payment.qrImageKey === "string" ? payment.qrImageKey : null,
    notes: "",
    accounts: Array.isArray(payment.qrs) ? (payment.qrs as AdminSettings["accounts"]) : [],
    policyDocuments: Array.isArray(raw.policyDocuments)
      ? (raw.policyDocuments as AdminSettings["policyDocuments"])
      : [],
    policyFormRequirements:
      (raw.policyFormRequirements as AdminSettings["policyFormRequirements"]) ??
      emptyPolicyFormRequirements(),
    paymentQrs: Array.isArray(payment.qrs) ? (payment.qrs as AdminSettings["paymentQrs"]) : [],
  };
}

export async function getAdminSettings(fetcher: ApiFetcher): Promise<AdminSettings> {
  return normalizeSettings(await fetcher<AdminSettingsResponse>("/api/admin/settings"));
}
export const patchAdminSettings = (fetcher: ApiFetcher, patch: Record<string, unknown>) =>
  fetcher<AdminSettingsResponse>("/api/admin/settings", { method: "PATCH", body: patch });
export type FaqItem = { id: string; question: string; answer: string; sortOrder: number };
export const createFaq = (fetcher: ApiFetcher, input: { question: string; answer: string }) =>
  fetcher<{ faq: FaqItem }>("/api/admin/settings/faqs", { method: "POST", body: input });
export const patchFaq = (
  fetcher: ApiFetcher,
  id: string,
  input: Partial<{ question: string; answer: string }>,
) => fetcher<{ faq: FaqItem }>(`/api/admin/settings/faqs/${id}`, { method: "PATCH", body: input });
export const deleteFaq = (fetcher: ApiFetcher, id: string) =>
  fetcher<{ deleted: string }>(`/api/admin/settings/faqs/${id}`, { method: "DELETE" });
export const reorderFaqs = (fetcher: ApiFetcher, ids: string[]) =>
  fetcher<{ faqs: FaqItem[] }>("/api/admin/settings/faqs/reorder", {
    method: "POST",
    body: { ids },
  });
export const getPolicyFormRequirements = (fetcher: ApiFetcher) =>
  fetcher<{ policyFormRequirements: Record<string, string[]> }>("/api/admin/settings/policy-forms");
export const putPolicyFormRequirements = (
  fetcher: ApiFetcher,
  requirements: Record<string, string[]>,
) => fetcher("/api/admin/settings/policy-forms", { method: "PUT", body: { requirements } });
