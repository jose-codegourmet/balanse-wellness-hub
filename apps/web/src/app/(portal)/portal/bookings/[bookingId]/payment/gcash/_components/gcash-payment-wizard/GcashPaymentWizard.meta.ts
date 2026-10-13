/** GCash payment wizard contract (customer/10-gcash-proof-upload.md). */
export const gcashPaymentWizardMeta = {
  purpose:
    "Three-step GCash flow for a held booking: 1) send the payment using the studio's QR or account number, 2) upload a receipt screenshot, 3) wait while the front desk checks it and confirms the spot.",
  api: {
    booking: "The signed-in customer's booking from getMyBooking.",
    instructions:
      "Payment accounts from getPaymentInstructions, or null when they could not be loaded. Each account's imageKey is a public QR URL.",
    policies:
      "Current payment_proof policy versions; accepted on step 2 and recorded after upload.",
    forcedStep: "Storybook only.",
    forcedExpired: "Storybook only.",
  },
  states: [
    "pay: QR opens a full-screen viewer with a close control; amount, account name and number have copy buttons; account switcher appears when several are shown",
    "pay, no accounts or load failure: explains and offers Pay at the front desk instead",
    "upload: PaymentProofForm; Back returns to pay",
    "review: proof submitted, waiting for the front desk; can upload a different screenshot",
    "rejected: paymentStatus REJECTED shows a notice on pay/upload",
    "package applied, confirmed, and expired hold each render their own end state",
  ],
  rules: [
    "Starts on review when a proof is already submitted.",
    "Uploading proof never confirms the booking; only the front desk does.",
    "Hold countdown comes from useHoldCountdown (never past class start).",
  ],
  whenToUse: "Use only on /portal/bookings/[bookingId]/payment/gcash.",
  whenNotToUse: "Do not use for package acquisition payments.",
} as const;
