import type { PolicyDocumentVersion } from "./admin";
import type { PolicyAcceptance } from "./types";

/**
 * Customer-facing forms that can require policy acceptance before submit.
 * Admin settings decide which policies each form shows; the customer always
 * accepts the current version of each attached policy.
 *
 * OQ-4: waiver/policy body copy is placeholder until legal text exists.
 * OQ-5: re-acceptance cadence is undecided; every submit asks again.
 */
export const CUSTOMER_POLICY_FORMS = [
  "sign_up",
  "booking",
  "package_request",
  "payment_proof",
  "reschedule",
  "cancellation",
  "contact",
] as const;

export type CustomerPolicyForm = (typeof CUSTOMER_POLICY_FORMS)[number];

export const CUSTOMER_POLICY_FORM_META: Record<
  CustomerPolicyForm,
  { label: string; description: string; path: string }
> = {
  sign_up: {
    label: "Sign up",
    description: "New customers accept these before their account is created.",
    path: "/sign-up",
  },
  booking: {
    label: "Class booking",
    description: "Shown before a customer reserves a class or joins a waitlist.",
    path: "/portal/book/[sessionId]",
  },
  package_request: {
    label: "Package request",
    description: "Shown before a customer claims or requests a package.",
    path: "/packages/[slug]",
  },
  payment_proof: {
    label: "GCash payment proof",
    description: "Shown before a customer submits a GCash screenshot.",
    path: "/portal/bookings/[bookingId]/payment/gcash",
  },
  reschedule: {
    label: "Reschedule request",
    description: "Shown before a customer submits a preferred session.",
    path: "/portal/bookings/[bookingId]/reschedule",
  },
  cancellation: {
    label: "Cancellation request",
    description: "Shown before a customer asks the studio to cancel a booking.",
    path: "/portal/bookings/[bookingId]/cancel",
  },
  contact: {
    label: "Contact form",
    description: "Shown before a visitor sends a message from the contact page.",
    path: "/contact",
  },
};

/** Policy document names attached to each customer form. */
export type PolicyFormRequirements = Record<CustomerPolicyForm, string[]>;

export function emptyPolicyFormRequirements(): PolicyFormRequirements {
  return Object.fromEntries(
    CUSTOMER_POLICY_FORMS.map((form) => [form, []]),
  ) as unknown as PolicyFormRequirements;
}

export function policyAcceptanceKey(doc: { documentName: string; version: string }): string {
  return `${doc.documentName}:${doc.version}`;
}

/** Current versions of the policies attached to `form`, in attachment order. */
export function currentPoliciesForForm(
  docs: readonly PolicyDocumentVersion[],
  requirements: PolicyFormRequirements,
  form: CustomerPolicyForm,
): PolicyDocumentVersion[] {
  return (requirements[form] ?? []).flatMap((name) => {
    const current = docs.find((doc) => doc.documentName === name && doc.current);
    return current ? [current] : [];
  });
}

/** Customer forms that currently show `documentName`. */
export function formsForPolicy(
  requirements: PolicyFormRequirements,
  documentName: string,
): CustomerPolicyForm[] {
  return CUSTOMER_POLICY_FORMS.filter((form) => (requirements[form] ?? []).includes(documentName));
}

export function toPolicyAcceptances(
  docs: readonly PolicyDocumentVersion[],
  acceptedAt: string,
  form?: CustomerPolicyForm,
): PolicyAcceptance[] {
  return docs.map((doc) => ({
    documentName: doc.documentName,
    version: doc.version,
    acceptedAt,
    ...(form ? { form } : {}),
  }));
}
