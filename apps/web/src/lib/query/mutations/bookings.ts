"use client";
import { type BookingInput, createBooking } from "@balanse/api-client";
import { apiFetchBrowser } from "@balanse/api-client/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { webKeys } from "../keys";
export function useCreateBooking(customerId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: BookingInput) => createBooking(apiFetchBrowser, input),
    // A new hold/waitlist entry changes the session's remaining slots, so the
    // calendar list and the session's own public page must refetch too (WIRE-0802, #363).
    onSuccess: (_result, input) => {
      queryClient.invalidateQueries({ queryKey: webKeys.bookings.all(customerId) });
      queryClient.invalidateQueries({ queryKey: webKeys.publicSession(input.sessionId) });
      queryClient.invalidateQueries({ queryKey: webKeys.publicSessionsAll() });
    },
  });
}
