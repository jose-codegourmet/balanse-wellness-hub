import type { AdminWizardProps, AdminWizardStep } from "./AdminWizard.schema";

export const adminWizardSteps: AdminWizardStep[] = [
  { id: "basics", title: "Basics", description: "Name and summary", fields: ["name"] },
  {
    id: "defaults",
    title: "Defaults",
    description: "Optional catalogue values",
    fields: ["notes"],
  },
  { id: "review", title: "Review", description: "Status" },
];

export const adminWizardDefaultValues: Partial<AdminWizardProps> = {
  title: "Create item",
  description: "Session values override class defaults.",
  steps: adminWizardSteps,
  mode: "create",
  surface: "page",
  closeHref: "/classes",
  defaultStep: 1,
};
