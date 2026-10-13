/** Customer package payment method screen contract. */
export const acquisitionPaymentPageMeta = {
  purpose:
    "First payment step for a paid package request, laid out like the booking payment screen: header band with the package name, sessions, validity, and amount due; the shared PaymentMethodForm; and a side card explaining there is no hold and what happens next. GCash continues to /gcash; cash returns to My packages.",
  api: {
    customerId: "Signed-in customer id (query invalidation).",
    acquisition: "The pending HttpBundleAcquisition from listMyPackages.",
    summary: "Package name, sessions, validity, and amount from loadAcquisitionPayment.",
    forcedStatus: "Storybook only. 'submitting' renders the saving state.",
  },
  states: [
    "choose: header band, PaymentMethodForm (context 'package'), side card",
    "save failed: toast payment.method-failed and the form stays editable",
    "pending review, approved, closed: handled by page.tsx (redirect to /gcash review or AcquisitionPaymentEndState)",
  ],
  rules: [
    "Choosing a method never activates the package; the studio approves it.",
    "Package requests have no hold or deadline.",
  ],
  whenToUse: "Use only on /portal/packages/acquisitions/[acquisitionId]/payment.",
  whenNotToUse: "Do not use for booking payments.",
} as const;
