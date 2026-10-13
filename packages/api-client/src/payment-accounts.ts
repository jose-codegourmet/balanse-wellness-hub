import type { PaymentAccountType, PaymentQrCode } from "@balanse/domain";
import type { ApiFetcher } from "./classes";

export type PaymentAccountInput = {
  type: PaymentAccountType;
  label: string;
  accountName: string;
  accountNumber: string;
  /** `null` creates/keeps no image (GCash/Maya); a confirmed upload key otherwise. */
  imageKey: string | null;
  isActive: boolean;
};

/** Admin payment account collection (WIRE-1703, #371). */
export async function listPaymentAccounts(
  fetcher: ApiFetcher,
  includeArchived = false,
): Promise<{ items: PaymentQrCode[] }> {
  const suffix = includeArchived ? "?includeArchived=true" : "";
  return fetcher(`/api/admin/settings/payment-qrs${suffix}`);
}

export async function createPaymentAccount(
  fetcher: ApiFetcher,
  input: PaymentAccountInput,
): Promise<{ qr: PaymentQrCode }> {
  return fetcher("/api/admin/settings/payment-qrs", { method: "POST", body: input });
}

export async function patchPaymentAccount(
  fetcher: ApiFetcher,
  id: string,
  input: Partial<PaymentAccountInput>,
): Promise<{ qr: PaymentQrCode }> {
  return fetcher(`/api/admin/settings/payment-qrs/${id}`, { method: "PATCH", body: input });
}

/** Mint step of the BE-052 lifecycle: signed URL to PUT bytes to, then confirm with its `objectKey`. */
export async function mintAccountImage(
  fetcher: ApiFetcher,
  contentType: string,
): Promise<{
  upload: { signedUrl: string; token: string; path: string; expiresIn: number };
  objectKey: string;
  bucket: string;
  maxBytes: number;
  contentTypes: string[];
}> {
  return fetcher("/api/admin/settings/payment-qrs/image", {
    method: "POST",
    body: { contentType },
  });
}

export async function confirmAccountImage(
  fetcher: ApiFetcher,
  objectKey: string,
): Promise<{ objectKey: string }> {
  return fetcher("/api/admin/settings/payment-qrs/image", { method: "POST", body: { objectKey } });
}

export async function activate(
  fetcher: ApiFetcher,
  id: string,
  active: boolean,
): Promise<{ qr: PaymentQrCode }> {
  return fetcher(`/api/admin/settings/payment-qrs/${id}/activate`, {
    method: "POST",
    body: { active },
  });
}

export async function archive(fetcher: ApiFetcher, id: string): Promise<{ qr: PaymentQrCode }> {
  return fetcher(`/api/admin/settings/payment-qrs/${id}`, { method: "DELETE" });
}
