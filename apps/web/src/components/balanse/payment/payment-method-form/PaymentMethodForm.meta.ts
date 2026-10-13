/** Payment method choice form contract. */
export const paymentMethodFormMeta = {
  purpose:
    "Let a customer choose GCash (send payment, then upload a receipt screenshot) or Pay at Counter (cash at the front desk) for a held booking or a paid package request. Each option states the amount and what happens next: for bookings, the hold deadline and that the front desk confirms the spot; for packages, that the studio activates the sessions.",
  api: {
    amountLabel: "Formatted amount due, e.g. formatPeso(session.pricePhp).",
    deadlineLabel: "Bookings only. When the hold ends, or null when the hold runs to class start.",
    context: "'booking' (default) or 'package'. Selects the option and footnote copy.",
    submitting: "Disables the options and shows a saving state on the button.",
    onSubmit: "Receives the validated PaymentMethod. The parent saves it and routes onward.",
  },
  whenToUse:
    "Use on /portal/bookings/[bookingId]/payment and /portal/packages/acquisitions/[acquisitionId]/payment.",
  whenNotToUse:
    "Do not use for admin cash recording. It never confirms a booking or activates a package.",
} as const;
