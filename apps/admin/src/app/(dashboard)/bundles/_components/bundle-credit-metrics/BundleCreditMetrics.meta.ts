export const bundleCreditMetricsMeta = {
  purpose:
    "Used, held, restored, and granted session credits for one package across every customer who owns it, with a used/held/remaining bar.",
  whenToUse:
    "Use at the top of /bundles/[bundleId]. Data comes from adminBundleMetricsQuery (getAdminBundleMetrics), keyed by bundle id.",
  whenNotToUse:
    "Do not use for one customer's balance (use the entitlement view) or for money totals — credits are sessions, not pesos.",
} as const;
