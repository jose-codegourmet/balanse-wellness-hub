"use client";

import type { CustomerProfile, CustomerProfileSectionId, PolicyAcceptance } from "@balanse/domain";
import { customerInitials } from "@balanse/domain";
import { UserRound } from "lucide-react";
import { useState } from "react";
import { AccountSettingsSection } from "./account-settings-section/AccountSettingsSection";
import { BasicProfileSection } from "./basic-profile-section/BasicProfileSection";
import { PasswordSettingsSection } from "./password-settings-section/PasswordSettingsSection";
import { PolicyHistorySection } from "./policy-history-section/PolicyHistorySection";
import { ProfileSettingsNav } from "./profile-settings-nav/ProfileSettingsNav";
import "@/components/balanse/portal/portal.css";

/**
 * Profile settings area (FE-CUS-017). The shell — heading, identity summary,
 * submenu — is shared; the routes under `/portal/profile/*` pick the section.
 * Only the active section is rendered, so nothing hidden is announced.
 */
export function ProfilePage({
  initialProfile,
  initialAcceptances,
  section = "basic",
  forcedStatus,
  forcedPasswordStatus,
}: {
  initialProfile: CustomerProfile;
  initialAcceptances: PolicyAcceptance[];
  section?: CustomerProfileSectionId;
  forcedStatus?: "saving" | "failed";
  forcedPasswordStatus?: "saved";
}) {
  const [savedProfile, setSavedProfile] = useState(initialProfile);

  return (
    <div className="portal-profile">
      <header className="profile-heading">
        <p className="profile-eyebrow">Your account</p>
        <h1 className="font-display">My profile</h1>
        <p>A few details to make every visit feel personal.</p>
      </header>
      <div className="profile-summary">
        <div className="profile-avatar" aria-hidden="true">
          {customerInitials(savedProfile.fullName)}
        </div>
        <div>
          <h2 className="font-display">{savedProfile.fullName}</h2>
          <p>{savedProfile.email}</p>
        </div>
        <span className="profile-account-label">
          <UserRound size={15} aria-hidden="true" /> Your Balansé account
        </span>
      </div>
      <div className="profile-layout">
        <ProfileSettingsNav activeSection={section} />
        <div className="profile-sections">
          {section === "basic" ? (
            <BasicProfileSection
              profile={savedProfile}
              onSaved={setSavedProfile}
              forcedStatus={forcedStatus}
            />
          ) : null}
          {section === "account" ? <AccountSettingsSection profile={savedProfile} /> : null}
          {section === "password" ? (
            <PasswordSettingsSection profile={savedProfile} forcedStatus={forcedPasswordStatus} />
          ) : null}
          {section === "policies" ? (
            <PolicyHistorySection acceptances={initialAcceptances} />
          ) : null}
        </div>
      </div>
    </div>
  );
}
