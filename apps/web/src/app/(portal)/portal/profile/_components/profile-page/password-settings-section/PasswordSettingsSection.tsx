import type { CustomerProfile } from "@balanse/domain";
import { customerAuthMethodCopy } from "@balanse/domain";
import { Info, Lock } from "lucide-react";
import { PasswordSettingsForm } from "./password-settings-form/PasswordSettingsForm";

export function PasswordSettingsSection({
  profile,
  forcedStatus,
}: {
  profile: CustomerProfile;
  forcedStatus?: "saved";
}) {
  const copy = customerAuthMethodCopy(profile.authMethod);
  const managedByGoogle = profile.authMethod === "google";

  return (
    <section data-section="password" className="profile-panel">
      <div className="profile-section-title">
        <Lock size={21} strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display">Password settings</h2>
      </div>
      <p className="profile-description">{copy.passwordNote}</p>
      {managedByGoogle ? (
        <p className="profile-mock-note profile-mock-note-lead">
          <Info size={15} aria-hidden="true" />
          Password fields are turned off because Google holds this credential.
        </p>
      ) : null}
      <PasswordSettingsForm profile={profile} forcedStatus={forcedStatus} />
    </section>
  );
}
