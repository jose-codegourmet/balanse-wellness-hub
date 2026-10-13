/** Customer payment method screen contract (customer/09-payment-method.md). */
export const paymentMethodPageMeta = {
  purpose:
    "Second step after reserving: shows the class, date, time, and amount due, a live hold countdown, and the GCash or Pay at Counter choice. GCash continues to the proof upload; cash returns to the booking. The front desk confirms the spot in both cases.",
  api: {
    booking: "The signed-in customer's booking from getMyBooking.",
    forcedExpired: "Storybook only. Renders the expired-hold state.",
    forcedStatus: "Storybook only. 'submitting' renders the saving state.",
  },
  states: [
    "choose: header band, PaymentMethodForm, hold card with countdown and next steps",
    "package applied: booking.entitlementId set, nothing to pay",
    "expired: hold deadline passed or status EXPIRED; refreshes the route once on expiry",
    "save failed: toast payment.method-failed and the form stays editable",
  ],
  rules: [
    "Hold deadline is min(holdExpiresAt, class start) and is not editable; no control is shown.",
    "Choosing a method never confirms the booking.",
    "Countdown reads the clock only after mount, so the server render stays deterministic.",
  ],
  whenToUse: "Use only on /portal/bookings/[bookingId]/payment.",
  whenNotToUse: "Do not use for package acquisition payments.",
} as const;
