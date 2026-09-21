import type { CustomerProfile } from "@balanse/domain";
import { PROFILE_FIELDS_NOTE } from "@balanse/domain";
import { UserRound } from "lucide-react";
import { BasicProfileForm } from "./basic-profile-form/BasicProfileForm";

export function BasicProfileSection({
  profile,
  onSaved,
  forcedStatus,
}: {
  profile: CustomerProfile;
  onSaved: (next: CustomerProfile) => void;
  forcedStatus?: "saving" | "failed";
}) {
  return (
    <section data-section="profile" className="profile-panel">
      <div className="profile-section-title">
        <UserRound size={21} strokeWidth={1.5} aria-hidden="true" />
        <h2 className="font-display">Basic profile</h2>
      </div>
      <p className="profile-description">We’ll use these details for your class bookings.</p>
      <p className="sr-only">{PROFILE_FIELDS_NOTE}</p>
      <BasicProfileForm profile={profile} onSaved={onSaved} forcedStatus={forcedStatus} />
    </section>
  );
}
