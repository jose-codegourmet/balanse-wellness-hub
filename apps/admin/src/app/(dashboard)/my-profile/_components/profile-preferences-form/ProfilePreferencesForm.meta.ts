import type { ProfilePreferencesFormValues } from "./ProfilePreferencesForm.schema";

/** Staff-owned, mock-session notification preference form. */
export type ProfilePreferencesFormProps = {
  defaultValues?: ProfilePreferencesFormValues;
  onSaved?: (values: ProfilePreferencesFormValues) => void;
};
