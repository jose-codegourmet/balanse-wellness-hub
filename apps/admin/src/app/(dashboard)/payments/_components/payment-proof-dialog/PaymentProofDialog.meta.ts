/** Payment receipt thumbnail + zoom dialog contract. */
export const paymentProofDialogMeta = {
  purpose:
    "Thumbnail of a customer's GCash receipt that opens a fit-to-viewport dialog. Used by the booking GCash queue and the package payment queue.",
  api: {
    url: "Image URL: a short-lived signed URL or a fixture path.",
    customerName: "Used in alt text and the dialog description.",
    defaultOpen: "Storybook only. Opens the dialog on mount.",
  },
  whenToUse: "Use inside /payments queue cards.",
  whenNotToUse: "Do not use for avatars or public images.",
} as const;
