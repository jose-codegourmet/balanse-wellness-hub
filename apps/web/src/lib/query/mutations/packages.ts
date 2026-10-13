"use client";

import {
  claimPackage,
  mintAcquisitionPaymentProof,
  requestPackage,
  setAcquisitionPaymentMethod,
  submitAcquisitionPaymentProof,
} from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { webKeys } from "../keys";

function invalidatePackages(queryClient: ReturnType<typeof useQueryClient>, customerId: string) {
  return queryClient.invalidateQueries({ queryKey: webKeys.packages.all(customerId) });
}

export function useClaimPackage(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bundleId, idempotencyKey }: { bundleId: string; idempotencyKey: string }) =>
      claimPackage(apiFetchBrowser, bundleId, idempotencyKey),
    onSuccess: () => invalidatePackages(queryClient, customerId),
  });
}

export function useRequestPackage(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ bundleId, idempotencyKey }: { bundleId: string; idempotencyKey: string }) =>
      requestPackage(apiFetchBrowser, bundleId, idempotencyKey),
    onSuccess: () => invalidatePackages(queryClient, customerId),
  });
}

export function useAcquisitionPaymentMethod(customerId: string, acquisitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (method: "GCASH" | "PAY_AT_COUNTER") =>
      setAcquisitionPaymentMethod(apiFetchBrowser, acquisitionId, method),
    onSuccess: () => invalidatePackages(queryClient, customerId),
  });
}

export function useSubmitAcquisitionProof(customerId: string, acquisitionId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const intent = await mintAcquisitionPaymentProof(
        apiFetchBrowser,
        acquisitionId,
        file.type,
        file.size,
      );
      const upload = await fetch(intent.upload.signedUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("Package payment proof upload failed.");
      return submitAcquisitionPaymentProof(apiFetchBrowser, acquisitionId, intent.upload.path);
    },
    onSuccess: () => invalidatePackages(queryClient, customerId),
  });
}
