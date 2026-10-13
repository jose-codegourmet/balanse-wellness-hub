/** GCash receipt upload form contract (wizard step 2). */
export const paymentProofFormMeta = {
  purpose:
    "Collect one receipt screenshot (JPG/PNG/WEBP/HEIC, up to 5 MB) with drag-and-drop and a preview, plus acceptance of the policies attached to the payment_proof form.",
  api: {
    amountLabel: "Formatted amount the receipt should show.",
    policies: "Current payment_proof policy versions. Each must be accepted before submit.",
    submitting: "Disables the drop zone and shows the uploading state.",
    onBack: "Returns to the pay step.",
    onSubmit:
      "Receives the validated File and the accepted policy version ids. The parent uploads.",
  },
  whenToUse: "Use only inside GcashPaymentWizard.",
  whenNotToUse: "Do not use for package acquisition proofs or admin uploads.",
} as const;
