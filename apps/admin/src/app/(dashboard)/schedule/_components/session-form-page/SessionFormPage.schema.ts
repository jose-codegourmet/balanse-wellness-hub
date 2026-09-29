import type { AdminSession } from "@balanse/domain";
import type { AdminWizardSurface } from "@/components/balanse/wizard/admin-wizard/AdminWizard.meta";

export { sessionFormSchema } from "@/modules/admin/forms/session/session-form.schema";
export type SessionFormPageProps = {
  sessionId: string;
  date?: string;
  /** `overlay` is a dialog (full screen on phones); `page` is a routed page. */
  surface?: AdminWizardSurface;
  /** Dialog use (e.g. the event form). Called with the saved session before closing. */
  onSaved?: (session: AdminSession) => void;
  /** Dialog use. Replaces the default close navigation (router back / `/schedule`). */
  onClose?: () => void;
};
