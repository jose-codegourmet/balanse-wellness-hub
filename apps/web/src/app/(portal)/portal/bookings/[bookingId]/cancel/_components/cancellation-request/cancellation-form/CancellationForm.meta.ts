/** Cancellation request form contract. */
export const cancellationFormMeta = {
  purpose: "Collect an optional cancellation reason and hand it to the request page.",
  whenToUse: "Use only on the customer booking cancellation route.",
  whenNotToUse: "Do not use for admin cancellation review.",
} as const;
