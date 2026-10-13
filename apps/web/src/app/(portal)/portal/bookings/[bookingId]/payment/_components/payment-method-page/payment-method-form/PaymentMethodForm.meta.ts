/** Payment method choice form contract. */
export const paymentMethodFormMeta = {
  purpose:
    "Let a customer with a held booking choose GCash (send payment, then upload a receipt screenshot) or Pay at Counter (cash at the front desk). Each option states the amount, the hold deadline, and that the front desk confirms the spot.",
  api: {
    amountLabel: "Formatted amount due, e.g. formatPeso(session.pricePhp).",
    deadlineLabel: "When the hold ends, or null when the hold runs to class start.",
    submitting: "Disables the options and shows a saving state on the button.",
    onSubmit: "Receives the validated PaymentMethod. The parent saves it and routes onward.",
  },
  whenToUse: "Use only on /portal/bookings/[bookingId]/payment.",
  whenNotToUse:
    "Do not use for package acquisition payments or admin cash recording. It never confirms a booking.",
} as const;
