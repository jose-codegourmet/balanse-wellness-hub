import type { AdminBundle } from "@balanse/domain";
import type { BundleFormValues } from "./bundle-form.schema";

export const bundleFormDefaultValues: BundleFormValues = {
  name: "",
  slug: "",
  summary: "",
  description: "",
  sessionCredits: 12,
  pricePhp: 0,
  applicabilityMode: "all",
  classIds: [],
  validityDays: null,
  perCustomerLimit: 1,
  status: "DRAFT",
};

export function bundleFormValuesFrom(bundle: AdminBundle): BundleFormValues {
  return {
    name: bundle.name,
    slug: bundle.slug,
    summary: bundle.summary,
    description: bundle.description,
    sessionCredits: bundle.sessionCreditCount,
    pricePhp: bundle.pricePhp,
    applicabilityMode: bundle.applicabilityMode === "ALL_ACTIVE_CLASSES" ? "all" : "selected",
    classIds: bundle.classIds,
    validityDays: bundle.validityDays,
    perCustomerLimit: bundle.perCustomerLimit,
    status: bundle.status,
  };
}
