/** Cancellation-request screen contract. */
export const cancellationRequestMeta = {
  purpose:
    "Let a customer review a booking, understand the manual cancellation consequences, and submit an optional reason.",
  whenToUse: "Use only on an existing customer booking cancellation route.",
  whenNotToUse: "Do not use for staff cancellation review or to instantly cancel a booking.",
} as const;
