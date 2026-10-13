"use client";
import { createCancellationRequest, createRescheduleRequest } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { webKeys } from "../keys";
export function useCreateCancellationRequest(customerId: string, bookingId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (reason?: string) => createCancellationRequest(apiFetchBrowser, bookingId, reason),
    onSuccess: () => client.invalidateQueries({ queryKey: webKeys.bookings.all(customerId) }),
  });
}
export function useCreateRescheduleRequest(customerId: string, bookingId: string) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (targetSessionId: string) =>
      createRescheduleRequest(apiFetchBrowser, bookingId, targetSessionId),
    onSuccess: () => client.invalidateQueries({ queryKey: webKeys.bookings.all(customerId) }),
  });
}
