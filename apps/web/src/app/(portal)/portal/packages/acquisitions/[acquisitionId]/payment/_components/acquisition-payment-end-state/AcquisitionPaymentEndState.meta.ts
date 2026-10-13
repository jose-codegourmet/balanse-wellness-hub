/** Package payment end-state contract. */
export const acquisitionPaymentEndStateMeta = {
  purpose:
    "Shown instead of the package payment screens when there is nothing left to pay: 'approved' links to the new package; 'closed' covers declined, cancelled, or unknown requests.",
  api: {
    kind: "'approved' (with entitlementId and package name) or 'closed'.",
  },
  whenToUse:
    "Use on /portal/packages/acquisitions/[acquisitionId]/payment and its /gcash step when the request is no longer pending.",
  whenNotToUse: "Do not use for booking payments.",
} as const;
