import type { AdminWizardSurface } from "@/components/balanse/wizard/admin-wizard/AdminWizard.meta";

export { sessionFormSchema } from "@/modules/admin/forms/session/session-form.schema";
export type SessionFormPageProps = {
  sessionId: string;
  date?: string;
  surface?: AdminWizardSurface;
  step?: number;
};
