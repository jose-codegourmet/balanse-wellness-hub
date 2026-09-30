/**
 * Policy checkboxes shown on a customer-facing form. Admin decides which
 * policies each form carries (Settings › Policies › Customer forms); the route
 * loads them with `getCustomerFormPolicies(form)` and passes them here.
 *
 * Pair with `usePolicyAcceptance(policies)`: spread `props` into the component
 * and call `check()` before submitting. Renders nothing when no policy is
 * attached, so a form without policies is unchanged.
 *
 * Do not use to change a form's own fields — those stay fixed.
 */
export const policyAcceptanceMeta = {
  purpose: "Require acceptance of admin-attached policies before a customer form submits.",
  whenToUse:
    "Sign up, class booking, package request, GCash proof, reschedule, cancellation, contact.",
  whenNotToUse: "Do not use for the profile policy history (read-only list).",
} as const;
