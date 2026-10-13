"use client";
import { confirmPaymentProof, mintPaymentProof, setPaymentMethod } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import type { PaymentMethod } from "@balanse/domain";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { webKeys } from "../keys";
export function useSetPaymentMethod(customerId: string, bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (method: PaymentMethod) => setPaymentMethod(apiFetchBrowser, bookingId, method),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: webKeys.bookings.all(customerId) }),
  });
}
export function useSubmitPaymentProof(customerId: string, bookingId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const intent = await mintPaymentProof(apiFetchBrowser, bookingId, file.type, file.size);
      const upload = await fetch(intent.upload.signedUrl, {
        method: "PUT",
        headers: { "content-type": file.type },
        body: file,
      });
      if (!upload.ok) throw new Error("Proof upload failed.");
      return confirmPaymentProof(apiFetchBrowser, bookingId, intent.upload.path);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: webKeys.bookings.all(customerId) }),
  });
}
