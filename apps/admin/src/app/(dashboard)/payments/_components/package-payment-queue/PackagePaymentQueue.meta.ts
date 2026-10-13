/** Package payment queue contract (Payments → Packages tab). */
export const packagePaymentQueueMeta = {
  purpose:
    "Review queue for paid session packages on /payments?tab=packages: submitted GCash receipts (Approve payment / Reject receipt with a reason) and Pay at Counter requests (Cash received). Approval activates the package; rejection closes the request.",
  api: {
    search: "Filters by customer name, email, or package name.",
  },
  states: [
    "receipt submitted: signed-URL receipt thumbnail, approve / reject",
    "paying at counter: cash received activates the package",
    "loading, error with retry, empty (admin.no-package-reviews)",
  ],
  rules: [
    "Data comes from GET /api/admin/package-acquisitions (shared cache with /bundles and /transactions); realtime keeps it current.",
    "Receipts are fetched through an audited short-lived signed URL.",
    "Actions require the bundles-manage action.",
  ],
  whenToUse: "Use only in the Packages tab of PaymentReviewPage.",
  whenNotToUse: "Do not use for booking payments.",
} as const;
