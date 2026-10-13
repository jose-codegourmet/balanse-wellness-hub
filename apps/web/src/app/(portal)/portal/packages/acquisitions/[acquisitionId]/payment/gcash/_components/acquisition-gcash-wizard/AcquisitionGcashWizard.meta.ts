/** Package GCash payment wizard contract. */
export const acquisitionGcashWizardMeta = {
  purpose:
    "Three-step GCash flow for a paid package request, matching the booking GCash wizard: 1) send the payment using the studio's QR or account number, 2) upload a receipt screenshot, 3) wait while the studio reviews it and activates the sessions.",
  api: {
    customerId: "Signed-in customer id (query invalidation, policy acceptance).",
    acquisition: "The pending HttpBundleAcquisition from listMyPackages.",
    summary: "Package name, sessions, validity, and amount from loadAcquisitionPayment.",
    instructions:
      "Payment accounts from getPaymentInstructions, or null when they could not be loaded.",
    policies:
      "Current payment_proof policy versions; accepted on step 2 and recorded with the acquisition id.",
    forcedStep: "Storybook only.",
  },
  states: [
    "pay: GcashPayStep (QR, copyable details, account switcher, Pay at the front desk fallback)",
    "upload: PaymentProofForm; Back returns to pay",
    "review: proof submitted (status PENDING_REVIEW); can upload a different screenshot",
  ],
  rules: [
    "Starts on review when a proof is already submitted.",
    "Sets the method to GCash before uploading if it isn't already.",
    "Uploading proof never activates the package; only the studio does.",
  ],
  whenToUse: "Use only on /portal/packages/acquisitions/[acquisitionId]/payment/gcash.",
  whenNotToUse: "Do not use for booking payments.",
} as const;
