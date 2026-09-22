import type { BundleDefinition } from "@balanse/domain";
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

export function bundleFormValuesFrom(bundle: BundleDefinition): BundleFormValues {
  return {
    name: bundle.name,
    slug: bundle.slug,
    summary: bundle.summary,
    description: bundle.description,
    sessionCredits: bundle.sessionCredits,
    pricePhp: bundle.pricePhp,
    applicabilityMode: bundle.applicability.allActiveClasses ? "all" : "selected",
    classIds: bundle.applicability.classIds,
    validityDays: bundle.validityDays,
    perCustomerLimit: bundle.perCustomerLimit,
    status: bundle.status,
  };
}
