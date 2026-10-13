/** Payment progress stepper contract. */
export const paymentStepperMeta = {
  purpose:
    "Horizontal progress bar for a multi-step customer payment (send payment, upload receipt, studio review). Earlier steps show a check; labels collapse to screen-reader text on small screens.",
  api: {
    steps: "Ordered steps with a stable id and a short label.",
    current: "Id of the active step.",
  },
  whenToUse: "Use at the top of a customer GCash payment flow (bookings or packages).",
  whenNotToUse: "Do not use for admin wizards or onboarding.",
} as const;
