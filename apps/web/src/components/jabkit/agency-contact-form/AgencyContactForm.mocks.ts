import type { AgencyContactFormProps } from "./AgencyContactForm.types";

export const agencyProjectTypes = [
  { value: "", label: "-- Choose --" },
  { value: "identity", label: "Identity" },
  { value: "editorial", label: "Editorial" },
  { value: "web", label: "Web" },
  { value: "direction", label: "Direction" },
  { value: "other", label: "Other" },
] as const;

export const agencyBudgets = [
  { value: "", label: "-- Choose --" },
  { value: "under-5k", label: "Under €5k" },
  { value: "5-15k", label: "€5-15k" },
  { value: "15-50k", label: "€15-50k" },
  { value: "50k-plus", label: "€50k+" },
] as const;

export const agencyContactFormMocks = {
  default: {
    nameLabel: "Name",
    emailLabel: "Email",
    projectTypeLabel: "Project type",
    budgetLabel: "Budget",
    briefLabel: "Brief",
    briefPlaceholder: "What are you working on?",
    requiredLabel: "Required",
    selectLabel: "Select",
    submitLabel: "Send message",
    sendingLabel: "Sending",
    successLabel: "Sent",
    projectTypes: [...agencyProjectTypes],
    budgets: [...agencyBudgets],
  },
  alternate: {
    nameLabel: "Your name",
    emailLabel: "Work email",
    projectTypeLabel: "Need",
    budgetLabel: "Range",
    briefLabel: "Notes",
    briefPlaceholder: "Timeline, references, constraints.",
    requiredLabel: "Required",
    selectLabel: "Select",
    submitLabel: "Send brief",
    sendingLabel: "Sending",
    successLabel: "Received",
    projectTypes: [
      { value: "", label: "-- Choose --" },
      { value: "audit", label: "Audit" },
      { value: "build", label: "Build" },
      { value: "steer", label: "Steer" },
    ],
    budgets: [
      { value: "", label: "-- Choose --" },
      { value: "under-10k", label: "Under €10k" },
      { value: "10-25k", label: "€10-25k" },
    ],
  },
} satisfies Record<string, AgencyContactFormProps>;
