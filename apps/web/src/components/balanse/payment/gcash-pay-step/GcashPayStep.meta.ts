/** GCash "send payment" step contract. */
export const gcashPayStepMeta = {
  purpose:
    "First step of a customer GCash payment: shows the studio's GCash accounts (switcher when several), a QR that opens full screen, and copyable amount, account name and number. Falls back to a Pay at the front desk link when no account is available.",
  api: {
    instructions:
      "Payment accounts from getPaymentInstructions, or null when they could not be loaded. Each account's imageKey is a public QR URL.",
    amountLabel: "Formatted amount due, e.g. formatPeso(pricePhp).",
    counterHref: "Target of the Pay at the front desk link (the payment method page).",
    onSent: "Called when the customer says they have sent the payment.",
  },
  whenToUse: "Use inside a customer GCash payment flow (bookings or packages).",
  whenNotToUse: "Do not use for admin payment account setup.",
} as const;
